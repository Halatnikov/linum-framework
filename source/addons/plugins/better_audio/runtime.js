// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.BetterAudio = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var pluginProto = cr.plugins_.BetterAudio.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	var audRuntime = null;
	var audInst = null;
	var audTag = "";
	var appPath = "";			// for Cordova only
	
	var API_HTML5 = 0;
	var API_WEBAUDIO = 1;
	var API_CORDOVA = 2;
	var API_APPMOBI = 3;
	var api = API_HTML5;
	var context = null;
	var audioBuffers = [];		// cache of buffers
	var audioInstances = [];	// cache of instances
	var lastAudio = null;
	var useOgg = false;			// determined at create time
	var timescale_mode = 0;
	var silent = false;
	var masterVolume = 1;
	var listenerX = 0;
	var listenerY = 0;
	var isContextSuspended = false;
	
	// Web Audio API positioned audio settings
	var panningModel = 1;		// HRTF
	var distanceModel = 1;		// Inverse
	var refDistance = 10;
	var maxDistance = 10000;
	var rolloffFactor = 1;
	
	// Mic input from the User Media object
	var micSource = null;
	var micTag = "";
	
	// Workarounds for browser playback limitations
	var useNextTouchWorkaround = false;			// heuristic in case play() does not return a promise and we have to guess if the play was blocked
	var playOnNextInput = [];					// C2AudioInstances with HTMLAudioElements to play on next input event
	var playMusicAsSoundWorkaround = false;		// play music tracks with Web Audio API
	var hasPlayedDummyBuffer = false;			// dummy buffer played to unblock AudioContext on some platforms
	
	function addAudioToPlayOnNextInput(a)
	{
		var i = playOnNextInput.indexOf(a);
		
		if (i === -1)
			playOnNextInput.push(a);
	};
	
	function tryPlayAudioElement(a)
	{
		var audioElem = a.instanceObject;
		
		// Try to play immediately. On modern browsers, this returns a promise that rejects if the playback is not allowed
		// at this time. On older browsers it will not return a Promise so we have to fall back to heuristics.
		var playRet;
		try {
			playRet = audioElem.play();
		}
		catch (err) {
			// Synchronous exception in play() call: queue for next input event
			addAudioToPlayOnNextInput(a);
			return;
		}
		
		if (playRet)		// promise was returned
		{
			// Rejects if can't play at this time
			playRet.catch(function (err)
			{
				addAudioToPlayOnNextInput(a);
			});
		}
		// Did not return promise and the play() call was made outside of a user input event on platforms that block autoplay:
		// assume the call did not work; queue for playback on next touch
		else if (useNextTouchWorkaround && !audRuntime.isInUserInputEvent)
		{
			addAudioToPlayOnNextInput(a);
		}
	};
	
	function playQueuedAudio()
	{
		var i, len, m, playRet;
		
		// On first call, play a dummy buffer to unblock the Web Audio API
		if (!hasPlayedDummyBuffer && !isContextSuspended && context)
		{
			playDummyBuffer();
			
			// Only unflag this once the audio context state indicates it is running. This means we keep trying
			// to unblock the audio context until it's successfully unblocked.
			if (context["state"] === "running")
				hasPlayedDummyBuffer = true;
		}
		
		// play() calls can still fail in a user input event due to browser heuristics. Make sure any play calls
		// that fail are added back in to the play queue.
		var tryPlay = playOnNextInput.slice(0);
		cr.clearArray(playOnNextInput);
		
		// If not in silent mode, make play() calls for any queued audio
		if (!silent)
		{
			for (i = 0, len = tryPlay.length; i < len; ++i)
			{
				m = tryPlay[i];
				
				if (!m.stopped && !m.is_paused)
				{
					playRet = m.instanceObject.play();
					
					if (playRet)
					{
						playRet.catch(function (err)
						{
							addAudioToPlayOnNextInput(m);
						});
					}
				}
			}
		}
	};
	
	function playDummyBuffer()
	{
		// First try to call resume() if AudioContext is in suspended state. This unblocks Chrome for Android.
		// Otherwise fall back to code intended for Safari, which plays an empty buffer to enable audio output.
		if (context["state"] === "suspended" && context["resume"])
			context["resume"]();
		
		if (!context["createBuffer"])
			return;
		
		// play empty buffer to unmute audio
		var buffer = context["createBuffer"](1, 220, 22050);
		var source = context["createBufferSource"]();
		source["buffer"] = buffer;
		source["connect"](context["destination"]);
		startSource(source);
	};
	
	// Listen for input events on both mobile and desktop to play any queued music in
	document.addEventListener("pointerup", playQueuedAudio, true);
	document.addEventListener("touchend", playQueuedAudio, true);
	document.addEventListener("click", playQueuedAudio, true);
	document.addEventListener("keydown", playQueuedAudio, true);
	document.addEventListener("gamepadconnected", playQueuedAudio, true);
	
	function dbToLinear(x)
	{
		var v = dbToLinear_nocap(x);
		
		if (!isFinite(v))	// accidentally passing a string can result in NaN; set volume to 0 if so
			v = 0;
		
		if (v < 0)
			v = 0;
		if (v > 1)
			v = 1;
		return v;
	};
	
	function linearToDb(x)
	{
		if (x < 0)
			x = 0;
		if (x > 1)
			x = 1;
		return linearToDb_nocap(x);
	};
	
	function dbToLinear_nocap(x)
	{
		return Math.pow(10, x / 20);
	};
	
	function linearToDb_nocap(x)
	{
		return (Math.log(x) / Math.log(10)) * 20;
	};
	
	// for web audio API effects: a map of tags to an array of effects to process in order
	// e.g. effects["mytag"] = [node, node, node...]
	var effects = {};
	
	// return first effect node to connect to, or the destination
	function getDestinationForTag(tag)
	{
		tag = tag.toLowerCase();
		
		if (effects.hasOwnProperty(tag))
		{
			if (effects[tag].length)
				return effects[tag][0].getInputNode();
		}
		
		return context["destination"];
	};
	
	// work around older web audio api versions
	function createGain()
	{
		if (context["createGain"])
			return context["createGain"]();
		else
			return context["createGainNode"]();
	};
	
	function createDelay(d)
	{
		if (context["createDelay"])
			return context["createDelay"](d);
		else
			return context["createDelayNode"](d);
	};
	
	function startSource(s, scheduledTime)
	{
		if (s["start"])
			s["start"](scheduledTime || 0);
		else
			s["noteOn"](scheduledTime || 0);
	};
	
	function startSourceAt(s, x, d, scheduledTime)
	{
		if (s["start"])
			s["start"](scheduledTime || 0, x);
		else
			s["noteGrainOn"](scheduledTime || 0, x, d - x);
	};
	
	function stopSource(s)
	{
		// work around a tizen bug where this sometimes mysteriously fails
		try {
			if (s["stop"])
				s["stop"](0);
			else
				s["noteOff"](0);
		}
		catch (e) {}
	};
	
	function setAudioParam(ap, value, ramp, time)
	{
		if (!ap)
			return;		// iOS is missing some parameters
			
		ap["cancelScheduledValues"](0);
		
		// set immediately if time is zero
		if (time === 0)
		{
			ap["value"] = value;
			return;
		}
		
		var curTime = context["currentTime"];
		time += curTime;
		
		// otherwise use the chosen ramp
		switch (ramp) {
		case 0:		// step
			ap["setValueAtTime"](value, time);
			break;
		case 1:		// linear
			ap["setValueAtTime"](ap["value"], curTime);		// to set what to ramp from
			ap["linearRampToValueAtTime"](value, time);
			break;
		case 2:		// exponential
			ap["setValueAtTime"](ap["value"], curTime);		// to set what to ramp from
			ap["exponentialRampToValueAtTime"](value, time);
			break;
		}
	};
	
	var filterTypes = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"];
	
	function FilterEffect(type, freq, detune, q, gain, mix)
	{
		this.type = "filter";
		this.params = [type, freq, detune, q, gain, mix];
		
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		
		// backwards-compat with older spec
		this.filterNode = context["createBiquadFilter"]();
		
		if (typeof this.filterNode["type"] === "number")
			this.filterNode["type"] = type;
		else
			this.filterNode["type"] = filterTypes[type];
		
		this.filterNode["frequency"]["value"] = freq;
		
		if (this.filterNode["detune"])		// iOS 6 doesn't have detune yet
			this.filterNode["detune"]["value"] = detune;
			
		this.filterNode["Q"]["value"] = q;
		this.filterNode["gain"]["value"] = gain;
		
		this.inputNode["connect"](this.filterNode);
		this.inputNode["connect"](this.dryNode);
		this.filterNode["connect"](this.wetNode);
	};
	
	FilterEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	
	FilterEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.filterNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	
	FilterEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	
	FilterEffect.prototype.setParam = function(param, value, ramp, time)
	{
		// this.params = [freq, detune, q, gain, mix];
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[5] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 1:		// filter frequency
			this.params[1] = value;
			setAudioParam(this.filterNode["frequency"], value, ramp, time);
			break;
		case 2:		// filter detune
			this.params[2] = value;
			setAudioParam(this.filterNode["detune"], value, ramp, time);
			break;
		case 3:		// filter Q
			this.params[3] = value;
			setAudioParam(this.filterNode["Q"], value, ramp, time);
			break;
		case 4:		// filter/delay gain (note value is in dB here)
			this.params[4] = value;
			setAudioParam(this.filterNode["gain"], value, ramp, time);
			break;
		}
	};
	
	function DelayEffect(delayTime, delayGain, mix)
	{
		this.type = "delay";
		this.params = [delayTime, delayGain, mix];
		
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		
		// Use a gain node to route the audio in a loop around a delay and another gain node
		this.mainNode = createGain();
		
		this.delayNode = createDelay(delayTime);
		this.delayNode["delayTime"]["value"] = delayTime;
		
		this.delayGainNode = createGain();
		this.delayGainNode["gain"]["value"] = delayGain;
		
		this.inputNode["connect"](this.mainNode);
		this.inputNode["connect"](this.dryNode);
		this.mainNode["connect"](this.wetNode);
		this.mainNode["connect"](this.delayNode);
		this.delayNode["connect"](this.delayGainNode);
		this.delayGainNode["connect"](this.mainNode);
	};
	
	DelayEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	
	DelayEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.mainNode["disconnect"]();
		this.delayNode["disconnect"]();
		this.delayGainNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	
	DelayEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	
	DelayEffect.prototype.setParam = function(param, value, ramp, time)
	{
		//this.params = [delayTime, delayGain, mix];
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[2] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 4:		// filter/delay gain (note value is passed in dB but needs to be linear here)
			this.params[1] = dbToLinear(value);
			setAudioParam(this.delayGainNode["gain"], dbToLinear(value), ramp, time);
			break;
		case 5:		// delay time
			this.params[0] = value;
			setAudioParam(this.delayNode["delayTime"], value, ramp, time);
			break;
		}
	};
	
	function ConvolveEffect(buffer, normalize, mix, src)
	{
		this.type = "convolve";
		this.params = [normalize, mix, src];

		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		
		this.convolveNode = context["createConvolver"]();
		
		if (buffer)
		{
			this.convolveNode["normalize"] = normalize;
			this.convolveNode["buffer"] = buffer;
		}
		
		this.inputNode["connect"](this.convolveNode);
		this.inputNode["connect"](this.dryNode);
		this.convolveNode["connect"](this.wetNode);
	};
	
	ConvolveEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	
	ConvolveEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.convolveNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	
	ConvolveEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	
	ConvolveEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		}
	};
	
	function FlangerEffect(delay, modulation, freq, feedback, mix)
	{
		this.type = "flanger";
		this.params = [delay, modulation, freq, feedback, mix];
		
		// Note the flanger at 100% mix is actually shared 50/50 between the wet and dry nodes,
		// and at 0% mix is all dry. So wet->dry goes 100 -> 50 for dry node and 0-50 for wet node.
		this.inputNode = createGain();
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - (mix / 2);
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix / 2;
		this.feedbackNode = createGain();
		this.feedbackNode["gain"]["value"] = feedback;
		
		this.delayNode = createDelay(delay + modulation);
		this.delayNode["delayTime"]["value"] = delay;
		
		// use oscillator -> gain to LFO on the delay time
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = modulation;
		
		this.inputNode["connect"](this.delayNode);
		this.inputNode["connect"](this.dryNode);
		this.delayNode["connect"](this.wetNode);
		this.delayNode["connect"](this.feedbackNode);
		this.feedbackNode["connect"](this.delayNode);
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.delayNode["delayTime"]);
		startSource(this.oscNode);
	};
	
	FlangerEffect.prototype.connectTo = function (node)
	{
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
	};
	
	FlangerEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.delayNode["disconnect"]();
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.dryNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.feedbackNode["disconnect"]();
	};
	
	FlangerEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	
	FlangerEffect.prototype.setParam = function(param, value, ramp, time)
	{
		// this.params = [delay, modulation, freq, feedback, mix];
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[4] = value;
			// note flanger goes to 50/50 mix for 100% wet
			setAudioParam(this.wetNode["gain"], value / 2, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - (value / 2), ramp, time);
			break;
		case 6:		// modulation
			this.params[1] = value / 1000;
			setAudioParam(this.oscGainNode["gain"], value / 1000, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[2] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		case 8:		// feedback
			this.params[3] = value / 100;
			setAudioParam(this.feedbackNode["gain"], value / 100, ramp, time);
			break;
		}
	};
	
	function PhaserEffect(freq, detune, q, modulation, modfreq, mix)
	{
		this.type = "phaser";
		this.params = [freq, detune, q, modulation, modfreq, mix];
		
		// Note the phaser at 100% mix is actually shared 50/50 between the wet and dry nodes,
		// and at 0% mix is all dry. So wet->dry goes 100 -> 50 for dry node and 0-50 for wet node.
		this.inputNode = createGain();
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - (mix / 2);
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix / 2;
		
		this.filterNode = context["createBiquadFilter"]();
		
		if (typeof this.filterNode["type"] === "number")
			this.filterNode["type"] = 7;	// all-pass
		else
			this.filterNode["type"] = "allpass";
	
		this.filterNode["frequency"]["value"] = freq;
		
		if (this.filterNode["detune"])		// iOS 6 doesn't have detune yet
			this.filterNode["detune"]["value"] = detune;
		
		this.filterNode["Q"]["value"] = q;
	
		// use oscillator -> gain to LFO on the frequency
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = modfreq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = modulation;
		
		this.inputNode["connect"](this.filterNode);
		this.inputNode["connect"](this.dryNode);
		this.filterNode["connect"](this.wetNode);
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.filterNode["frequency"]);
		startSource(this.oscNode);
	};
	
	PhaserEffect.prototype.connectTo = function (node)
	{
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
	};
	
	PhaserEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.filterNode["disconnect"]();
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.dryNode["disconnect"]();
		this.wetNode["disconnect"]();
	};
	
	PhaserEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	
	PhaserEffect.prototype.setParam = function(param, value, ramp, time)
	{
		// this.params = [freq, detune, q, modulation, modfreq, mix];
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[5] = value;
			// note phaser goes to 50/50 mix for 100% wet
			setAudioParam(this.wetNode["gain"], value / 2, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - (value / 2), ramp, time);
			break;
		case 1:		// filter frequency
			this.params[0] = value;
			setAudioParam(this.filterNode["frequency"], value, ramp, time);
			break;
		case 2:		// filter detune
			this.params[1] = value;
			setAudioParam(this.filterNode["detune"], value, ramp, time);
			break;
		case 3:		// filter Q
			this.params[2] = value;
			setAudioParam(this.filterNode["Q"], value, ramp, time);
			break;
		case 6:		// modulation
			this.params[3] = value;
			setAudioParam(this.oscGainNode["gain"], value, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[4] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	
	function GainEffect(g)
	{
		this.type = "gain";
		this.params = [g];
		
		this.node = createGain();
		this.node["gain"]["value"] = g;
	};
	
	GainEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	
	GainEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	
	GainEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	
	GainEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 4:		// gain
			this.params[0] = dbToLinear(value);
			setAudioParam(this.node["gain"], dbToLinear(value), ramp, time);
			break;
		}
	};
	
	function TremoloEffect(freq, mix)
	{
		this.type = "tremolo";
		this.params = [freq, mix];
		
		// note the mix goes from 0 (gain of 1, modulating by 0) to 1 (gain of 0.5, modulating by 0.5)
		this.node = createGain();
		this.node["gain"]["value"] = 1 - (mix / 2);
		
		// modulate the gain value with an oscillator
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscGainNode = createGain();
		this.oscGainNode["gain"]["value"] = mix / 2;
		
		this.oscNode["connect"](this.oscGainNode);
		this.oscGainNode["connect"](this.node["gain"]);
		startSource(this.oscNode);
	};
	
	TremoloEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	
	TremoloEffect.prototype.remove = function ()
	{
		this.oscNode["disconnect"]();
		this.oscGainNode["disconnect"]();
		this.node["disconnect"]();
	};
	
	TremoloEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	
	TremoloEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.node["gain"]["value"], 1 - (value / 2), ramp, time);
			setAudioParam(this.oscGainNode["gain"]["value"], value / 2, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[0] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	
	function RingModulatorEffect(freq, mix)
	{
		this.type = "ringmod";
		this.params = [freq, mix];
		
		this.inputNode = createGain();
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		this.ringNode = createGain();
		this.ringNode["gain"]["value"] = 0;
		
		this.oscNode = context["createOscillator"]();
		this.oscNode["frequency"]["value"] = freq;
		this.oscNode["connect"](this.ringNode["gain"]);
		startSource(this.oscNode);
		
		this.inputNode["connect"](this.ringNode);
		this.inputNode["connect"](this.dryNode);
		this.ringNode["connect"](this.wetNode);
	};
	
	RingModulatorEffect.prototype.connectTo = function (node_)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node_);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node_);
	};
	
	RingModulatorEffect.prototype.remove = function ()
	{
		this.oscNode["disconnect"]();
		this.ringNode["disconnect"]();
		this.inputNode["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	
	RingModulatorEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	
	RingModulatorEffect.prototype.setParam = function(param, value, ramp, time)
	{
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[1] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		case 7:		// modulation frequency
			this.params[0] = value;
			setAudioParam(this.oscNode["frequency"], value, ramp, time);
			break;
		}
	};
	
	// Distortion based on some code by Google Inc. under BSD license
	// http://webaudiodemos.appspot.com/input/js/waveshaper.js
	function DistortionEffect(threshold, headroom, drive, makeupgain, mix)
	{
		this.type = "distortion";
		this.params = [threshold, headroom, drive, makeupgain, mix];
		
		this.inputNode = createGain();
		this.preGain = createGain();
		this.postGain = createGain();
		this.setDrive(drive, dbToLinear_nocap(makeupgain));
		this.wetNode = createGain();
		this.wetNode["gain"]["value"] = mix;
		this.dryNode = createGain();
		this.dryNode["gain"]["value"] = 1 - mix;
		
		this.waveShaper = context["createWaveShaper"]();
		this.curve = new Float32Array(65536);
		this.generateColortouchCurve(threshold, headroom);
		this.waveShaper.curve = this.curve;
		
		this.inputNode["connect"](this.preGain);
		this.inputNode["connect"](this.dryNode);
		this.preGain["connect"](this.waveShaper);
		this.waveShaper["connect"](this.postGain);
		this.postGain["connect"](this.wetNode);
	};
	
	DistortionEffect.prototype.setDrive = function (drive, makeupgain)
	{
		if (drive < 0.01)
			drive = 0.01;
		
		this.preGain["gain"]["value"] = drive;
		this.postGain["gain"]["value"] = Math.pow(1 / drive, 0.6) * makeupgain;
	};
	
	function e4(x, k)
	{
		return 1.0 - Math.exp(-k * x);
	}
	
	DistortionEffect.prototype.shape = function (x, linearThreshold, linearHeadroom)
	{		
		var maximum = 1.05 * linearHeadroom * linearThreshold;
		var kk = (maximum - linearThreshold);
		
		var sign = x < 0 ? -1 : +1;
		var absx = x < 0 ? -x : x;
		
		var shapedInput = absx < linearThreshold ? absx : linearThreshold + kk * e4(absx - linearThreshold, 1.0 / kk);
		shapedInput *= sign;
		
		return shapedInput;
	};
	
	DistortionEffect.prototype.generateColortouchCurve = function (threshold, headroom)
	{
		var linearThreshold = dbToLinear_nocap(threshold);
		var linearHeadroom = dbToLinear_nocap(headroom);
		
		var n = 65536;
		var n2 = n / 2;
		var x = 0;
		
		for (var i = 0; i < n2; ++i) {
			x = i / n2;
			x = this.shape(x, linearThreshold, linearHeadroom);
			
			this.curve[n2 + i] = x;
			this.curve[n2 - i - 1] = -x;
		}
	};
	
	DistortionEffect.prototype.connectTo = function (node)
	{
		this.wetNode["disconnect"]();
		this.wetNode["connect"](node);
		this.dryNode["disconnect"]();
		this.dryNode["connect"](node);
	};
	
	DistortionEffect.prototype.remove = function ()
	{
		this.inputNode["disconnect"]();
		this.preGain["disconnect"]();
		this.waveShaper["disconnect"]();
		this.postGain["disconnect"]();
		this.wetNode["disconnect"]();
		this.dryNode["disconnect"]();
	};
	
	DistortionEffect.prototype.getInputNode = function ()
	{
		return this.inputNode;
	};
	
	DistortionEffect.prototype.setParam = function(param, value, ramp, time)
	{
		// this.params = [threshold, headroom, drive, makeupgain, mix];
		switch (param) {
		case 0:		// mix
			value = value / 100;
			if (value < 0) value = 0;
			if (value > 1) value = 1;
			this.params[4] = value;
			setAudioParam(this.wetNode["gain"], value, ramp, time);
			setAudioParam(this.dryNode["gain"], 1 - value, ramp, time);
			break;
		}
	};
	
	function CompressorEffect(threshold, knee, ratio, attack, release)
	{
		this.type = "compressor";
		this.params = [threshold, knee, ratio, attack, release];
		
		this.node = context["createDynamicsCompressor"]();
		
		try {
			this.node["threshold"]["value"] = threshold;
			this.node["knee"]["value"] = knee;
			this.node["ratio"]["value"] = ratio;
			this.node["attack"]["value"] = attack;
			this.node["release"]["value"] = release;
		}
		catch (e) {}
	};
	
	CompressorEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	
	CompressorEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	
	CompressorEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	
	CompressorEffect.prototype.setParam = function(param, value, ramp, time)
	{
		// not supported
	};
	
	function AnalyserEffect(fftSize, smoothing)
	{
		this.type = "analyser";
		this.params = [fftSize, smoothing];
		
		this.node = context["createAnalyser"]();
		this.node["fftSize"] = fftSize;
		this.node["smoothingTimeConstant"] = smoothing;
		
		this.freqBins = new Float32Array(this.node["frequencyBinCount"]);
		this.signal = new Uint8Array(fftSize);
		this.peak = 0;
		this.rms = 0;
	};
	
	AnalyserEffect.prototype.tick = function ()
	{
		this.node["getFloatFrequencyData"](this.freqBins);
		this.node["getByteTimeDomainData"](this.signal);
		
		var fftSize = this.node["fftSize"];
		var i = 0;
		this.peak = 0;
		var rmsSquaredSum = 0;
		var s = 0;
		
		for ( ; i < fftSize; i++)
		{
			// get signal as absolute value from 0 to 1 then convert to dB
			s = (this.signal[i] - 128) / 128;
			if (s < 0)
				s = -s;
			
			if (this.peak < s)
				this.peak = s;
			
			rmsSquaredSum += s * s;			
		}
		
		this.peak = linearToDb(this.peak);
		this.rms = linearToDb(Math.sqrt(rmsSquaredSum / fftSize));
	};
	
	AnalyserEffect.prototype.connectTo = function (node_)
	{
		this.node["disconnect"]();
		this.node["connect"](node_);
	};
	
	AnalyserEffect.prototype.remove = function ()
	{
		this.node["disconnect"]();
	};
	
	AnalyserEffect.prototype.getInputNode = function ()
	{
		return this.node;
	};
	
	AnalyserEffect.prototype.setParam = function(param, value, ramp, time)
	{
		// not supported
	};
	
	// ObjectTracker used to track velocities for doppler effects, but doppler effects were removed.
	// TODO: refactor away ObjectTracker entirely.
	function ObjectTracker()
	{
		this.obj = null;
		this.loadUid = 0;
	};
	
	ObjectTracker.prototype.setObject = function (obj_)
	{
		this.obj = obj_;
	};
	
	ObjectTracker.prototype.hasObject = function ()
	{
		return !!this.obj;
	};
	
	ObjectTracker.prototype.tick = function (dt)
	{
	};
	
	function C2AudioBuffer(src_, is_music)
	{
		this.src = src_;
		this.myapi = api;
		this.is_music = is_music;
		this.added_end_listener = false;
		var self = this;
		this.outNode = null;
		this.mediaSourceNode = null;
		this.panWhenReady = [];		// for web audio API positioned sounds
		this.seekWhenReady = 0;
		this.pauseWhenReady = false;
		this.supportWebAudioAPI = false;
		this.failedToLoad = false;
		this.wasEverReady = false;	// if a buffer is ever marked as ready, it's permanently considered ready after then.
									// this works around browsers changing the 'readyState' back when it previously indicated
									// that it could play to the end.
		
		// If using the Web Audio API, still play music as HTML5 audio since it streams.
		// Otherwise AJAXing the music will not play it until it is completely downloaded.
		// Note some platforms are really stupid and don't let us start HTML5 audio until
		// a touch event, so we might not play the HTML5 audio until then when isMusicWorkaround set.
		// Also avoid doing this if we want to play music as sound via Web Audio (e.g. WKWebView).
		if (api === API_WEBAUDIO && is_music && !playMusicAsSoundWorkaround)
		{
			this.myapi = API_HTML5;
			
			// due to perculiarities in media source nodes in the Web Audio API, create
			// a gain node to connect out to other instances. Only when the audio is ready
			// do we then create a media source and then connect that to the gain node.
			this.outNode = createGain();
		}
		
		// may be null until Web Audio API ajax completes
		this.bufferObject = null;			// actual audio object
		this.audioData = null;				// web audio api: ajax request result (compressed audio that needs decoding)
		var request;
		
		switch (this.myapi) {
		case API_HTML5:
		
			this.bufferObject = new Audio();
			this.bufferObject.crossOrigin = "anonymous";
			
			this.bufferObject.addEventListener("canplaythrough", function () {
				self.wasEverReady = true;	// update loaded state so preload is considered complete
			});
			
			// when using MediaElementAudioSourceNode for Web Audio API,
			// connect it only on the "canplay" event, otherwise it doesn't seem to work properly
			// in Chrome. We can happily connect up outNode before this fires though.
			// Note: WKWebView treats as cross-origin, so we can't route it this way.
			if (api === API_WEBAUDIO && context["createMediaElementSource"] && !/wiiu/i.test(navigator.userAgent))
			{
				this.supportWebAudioAPI = true;		// can be routed through web audio api
				
				this.bufferObject.addEventListener("canplay", function ()
				{
					// protect against this event firing twice; also verify buffer wasn't released in time it took for "canplay" event to fire
					if (!self.mediaSourceNode && self.bufferObject)
					{
						self.mediaSourceNode = context["createMediaElementSource"](self.bufferObject);
						self.mediaSourceNode["connect"](self.outNode);
					}
				});
			}
			
			this.bufferObject.autoplay = false;	// this is only a source buffer, not an instance
			this.bufferObject.preload = "auto";
			this.bufferObject.src = src_;
			break;
			
		case API_WEBAUDIO:
			if (audRuntime.isWKWebView)
			{
				audRuntime.fetchLocalFileViaCordovaAsArrayBuffer(src_, function (arrayBuffer)
				{
					self.audioData = arrayBuffer;
					self.decodeAudioBuffer();
				}, function (err)
				{
					self.failedToLoad = true;
				});
			}
			else
			{
				request = new XMLHttpRequest();
				request.open("GET", src_, true);
				request.responseType = "arraybuffer";
				
				request.onload = function () {
					self.audioData = request.response;
					self.decodeAudioBuffer();
				};
				
				request.onerror = function () {
					self.failedToLoad = true;
				};
				
				request.send();
			}
			break;
			
		case API_CORDOVA:
			// Just refer to src instead
			this.bufferObject = true;
			break;
			
		case API_APPMOBI:
			// Just refer to src instead
			this.bufferObject = true;
			break;
		}
	};
	
	C2AudioBuffer.prototype.release = function ()
	{
		// Remove any audio instances from this buffer
		var i, len, j, a;
		
		for (i = 0, j = 0, len = audioInstances.length; i < len; ++i)
		{
			a = audioInstances[i];
			audioInstances[j] = a;
			
			if (a.buffer === this)
				a.stop();
			else
				++j;		// keep
		}
		
		audioInstances.length = j;
		
		// clean up nodes created for media element playback
		if (this.mediaSourceNode)
		{
			this.mediaSourceNode["disconnect"]();
			this.mediaSourceNode = null;
		}
		
		if (this.outNode)
		{
			this.outNode["disconnect"]();
			this.outNode = null;
		}
		
		// release data for GC
		this.bufferObject = null;
		this.audioData = null;
	};
	
	C2AudioBuffer.prototype.decodeAudioBuffer = function ()
	{
		if (this.bufferObject || !this.audioData)
			return;		// audio already decoded or AJAX request not yet complete
		
		var self = this;
		
		if (context["decodeAudioData"])
		{
			context["decodeAudioData"](this.audioData, function (buffer) {
					self.bufferObject = buffer;
					self.audioData = null;		// clear AJAX response to allow GC and save memory, only need the bufferObject now
					var p, i, len, a;
					
					if (!cr.is_undefined(self.playTagWhenReady) && !silent)
					{								
						if (self.panWhenReady.length)
						{
							for (i = 0, len = self.panWhenReady.length; i < len; i++)
							{
								p = self.panWhenReady[i];
								
								a = new C2AudioInstance(self, p.thistag);
								a.setPannerEnabled(true);
								
								if (typeof p.objUid !== "undefined")
								{
									p.obj = audRuntime.getObjectByUID(p.objUid);
									if (!p.obj)
										continue;
								}
								
								if (p.obj)
								{
									var px = cr.rotatePtAround(p.obj.x, p.obj.y, -p.obj.layer.getAngle(), listenerX, listenerY, true);
									var py = cr.rotatePtAround(p.obj.x, p.obj.y, -p.obj.layer.getAngle(), listenerX, listenerY, false);
									a.setPan(px, py, cr.to_degrees(p.obj.angle - p.obj.layer.getAngle()), p.ia, p.oa, p.og);
									a.setObject(p.obj);
								}
								else
								{
									a.setPan(p.x, p.y, p.a, p.ia, p.oa, p.og);
								}
								
								a.play(self.loopWhenReady, self.volumeWhenReady, self.seekWhenReady);
								
								if (self.pauseWhenReady)
									a.pause();
								
								audioInstances.push(a);
							}
							
							cr.clearArray(self.panWhenReady);
						}
						else
						{
							a = new C2AudioInstance(self, self.playTagWhenReady || "");		// sometimes playTagWhenReady is not set - TODO: why?
							a.play(self.loopWhenReady, self.volumeWhenReady, self.seekWhenReady);
							
							if (self.pauseWhenReady)
								a.pause();
							
							audioInstances.push(a);
						}
					}
					else if (!cr.is_undefined(self.convolveWhenReady))
					{
						var convolveNode = self.convolveWhenReady.convolveNode;
						convolveNode["normalize"] = self.normalizeWhenReady;
						convolveNode["buffer"] = buffer;
					}
			}, function (e) {
				// error decoding audio buffer
				self.failedToLoad = true;
			});
		}
		else
		{
			// No async decode available, use sync decode
			this.bufferObject = context["createBuffer"](this.audioData, false);
			this.audioData = null;		// clear AJAX response to allow GC and save memory, only need the bufferObject now
			
			if (!cr.is_undefined(this.playTagWhenReady) && !silent)
			{
				var a = new C2AudioInstance(this, this.playTagWhenReady);
				a.play(this.loopWhenReady, this.volumeWhenReady, this.seekWhenReady);
				
				if (this.pauseWhenReady)
					a.pause();
				
				audioInstances.push(a);
			}
			else if (!cr.is_undefined(this.convolveWhenReady))
			{
				var convolveNode = this.convolveWhenReady.convolveNode;
				convolveNode["normalize"] = this.normalizeWhenReady;
				convolveNode["buffer"] = this.bufferObject;
			}
		}
	};
	
	C2AudioBuffer.prototype.isLoaded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			// Only indicates can play through to end, assume this is good enough to assume preloaded
			var ret = this.bufferObject["readyState"] >= 4;	// HAVE_ENOUGH_DATA
			
			// Some browsers (at least Firefox) change the readyState back lower even after it reaches HAVE_ENOUGH_DATA.
			// To avoid this hanging 'All preloads complete', consider audio permanently preloaded after it first
			// reaches HAVE_ENOUGH_DATA.
			if (ret)
				this.wasEverReady = true;
			
			return ret || this.wasEverReady;
			
		case API_WEBAUDIO:
			// either AJAX request completed and audio decode pending, or audio finished decoding (and AJAX data cleared)
			return !!this.audioData || !!this.bufferObject;
			
		case API_CORDOVA:
			// Does not support preloading
			return true;
			
		case API_APPMOBI:
			// Does not support preloading
			return true;
		}
		
		// Should not reach here
		return false;
	};
	
	C2AudioBuffer.prototype.isLoadedAndDecoded = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return this.isLoaded();		// no distinction between loaded and decoded in HTML5 audio, just rely on ready state
			
		case API_WEBAUDIO:
			// decodeAudioData has completed (implies AJAX request also finished but the response was cleared to save memory)
			return !!this.bufferObject;
			
		case API_CORDOVA:
			// Does not support preloading
			return true;
			
		case API_APPMOBI:
			// Does not support preloading
			return true;
		}
		
		// Should not reach here
		return false;
	};
	
	C2AudioBuffer.prototype.hasFailedToLoad = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			return !!this.bufferObject["error"];
			
		case API_WEBAUDIO:
			return this.failedToLoad;
		}
		
		return false;
	};
	
	function C2AudioInstance(buffer_, tag_)
	{
		var self = this;
		
		this.tag = tag_;
		this.fresh = true;
		this.stopped = true;
		this.src = buffer_.src;
		this.buffer = buffer_;
		this.myapi = api;
		this.is_music = buffer_.is_music;
		this.playbackRate = 1;
		this.hasPlaybackEnded = true;	// ended flag
		this.resume_me = false;			// make sure resumes when leaving suspend
		this.is_paused = false;
		this.resume_position = 0;		// for web audio api to resume from correct playback position
		this.looping = false;
		this.is_muted = false;
		this.is_silent = false;
		this.volume = 1;
		
		// for Web Audio API onended event
		this.onended_handler = function (e)
		{
			// Web Audio fires "onended" when pausing a sound, but we don't want to consider
			// that as playback ending. So ignore this event if is_paused is set.
			// resume_me is also set if it was paused due to suspending.
			if (self.is_paused || self.resume_me)
				return;
			
			// NOTE: due to a bug in iOS 8, onended fires with a null 'this'. It is supposed to be
			// the AudioBufferSourceNode that ended, and the active_buffer check will fail if it is
			// not correct. To work around the iOS 8 bug, if 'this' is not set, look for the buffer
			// in the event target instead, which does appear to be correctly set in iOS 8.
			var bufferThatEnded = this;
			if (!bufferThatEnded)
				bufferThatEnded = e.target;
			
			if (bufferThatEnded !== self.active_buffer)
				return;
			
			self.hasPlaybackEnded = true;
			self.stopped = true;
			audTag = self.tag;
			audRuntime.trigger(cr.plugins_.BetterAudio.prototype.cnds.OnEnded, audInst);
		};
		
		// Seeking is implemented as a pause, change resume position, then resume.
		// The browser fires its "ended" event next tick after it ends, which
		// means it misses the "paused" flag and decides the sound has ended. To avoid
		// this, we keep a reference to the only buffer we're interested in ended events for.
		this.active_buffer = null;
		
		this.isTimescaled = ((timescale_mode === 1 && !this.is_music) || timescale_mode === 2);
		
		// Web Audio API only
		this.mutevol = 1;
		this.startTime = (this.isTimescaled ? audRuntime.kahanTime.sum : audRuntime.wallTime.sum);
		this.gainNode = null;
		this.pannerNode = null;
		this.pannerEnabled = false;
		this.objectTracker = null;
		this.panX = 0;
		this.panY = 0;
		this.panAngle = 0;
		this.panConeInner = 0;
		this.panConeOuter = 0;
		this.panConeOuterGain = 0;
		
		this.instanceObject = null;
		var add_end_listener = false;
		
		// If this is using Web Audio API but the buffer is not routing through Web Audio API,
		// fall back to HTML5 audio
		if (this.myapi === API_WEBAUDIO && this.buffer.myapi === API_HTML5 && !this.buffer.supportWebAudioAPI)
			this.myapi = API_HTML5;
		
		switch (this.myapi) {
		case API_HTML5:
			// For music recycle the buffer audio object
			if (this.is_music)
			{
				this.instanceObject = buffer_.bufferObject;
				add_end_listener = !buffer_.added_end_listener;
				buffer_.added_end_listener = true;
			}
			else
			{
				// Just make a new audio object
				this.instanceObject = new Audio();
				this.instanceObject.crossOrigin = "anonymous";
				this.instanceObject.autoplay = false;
				this.instanceObject.src = buffer_.bufferObject.src;
				add_end_listener = true;
			}
			
			if (add_end_listener)
			{
				this.instanceObject.addEventListener('ended', function () {
						audTag = self.tag;
						self.stopped = true;
						audRuntime.trigger(cr.plugins_.BetterAudio.prototype.cnds.OnEnded, audInst);
				});
			}
			
			break;
		case API_WEBAUDIO:
			this.gainNode = createGain();
			this.gainNode["connect"](getDestinationForTag(tag_));
			
			// Buffer is also web audio API (for sfx)
			if (this.buffer.myapi === API_WEBAUDIO)
			{					
				// If the buffer is ready, make a new sound instance
				if (buffer_.bufferObject)
				{
					this.instanceObject = context["createBufferSource"]();
					this.instanceObject["buffer"] = buffer_.bufferObject;
					this.instanceObject["connect"](this.gainNode);
				}
			}
			// Buffer is HTMLMediaElement (for music)
			else
			{
				this.instanceObject = this.buffer.bufferObject;		// reference the audio element
				this.buffer.outNode["connect"](this.gainNode);
				
				// Ensure ended event added for the underlying media element
				if (!this.buffer.added_end_listener)
				{
					this.buffer.added_end_listener = true;
					
					this.buffer.bufferObject.addEventListener('ended', function () {
							audTag = self.tag;
							self.stopped = true;
							audRuntime.trigger(cr.plugins_.BetterAudio.prototype.cnds.OnEnded, audInst);
					});
				}
			}
			break;
		case API_CORDOVA:
			
			// Create new Media object.  Include full path to the media file.		
			this.instanceObject = new window["Media"](appPath + this.src, null, null, function (status) {
					if (status === window["Media"]["MEDIA_STOPPED"])
					{
						self.hasPlaybackEnded = true;
						self.stopped = true;
						audTag = self.tag;
						audRuntime.trigger(cr.plugins_.BetterAudio.prototype.cnds.OnEnded, audInst);
					}
			});
			
			break;
			
		case API_APPMOBI:
			// Ridiculously simple API, only uses src
			this.instanceObject = true;
			break;
		}
	};
	
	C2AudioInstance.prototype.hasEnded = function ()
	{
		var time;
		
		// Only HTML5 audio has an actual ended property, rest have to go by duration.
		switch (this.myapi) {
		case API_HTML5:
			return this.instanceObject.ended;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				// looping - won't end
				if (!this.fresh && !this.stopped && this.instanceObject["loop"])
					return false;
				
				// paused - hasn't ended yet
				if (this.is_paused)
					return false;
				
				// Wait until onended fires
				return this.hasPlaybackEnded;
			}
			else
				return this.instanceObject.ended;
		
		case API_CORDOVA:
			return this.hasPlaybackEnded;
			
		case API_APPMOBI:
			true;	// recycling an AppMobi sound does not matter because it will just do another throwaway playSound
		}
		
		// should not reach here
		return true;
	};
	
	C2AudioInstance.prototype.canBeRecycled = function ()
	{
		if (this.fresh || this.stopped)
			return true;		// not yet used or is not playing
			
		return this.hasEnded();
	};
	
	C2AudioInstance.prototype.setPannerEnabled = function (enable_)
	{
		if (api !== API_WEBAUDIO)
			return;
		
		// when not enabled, route just goes: source -> gain -> dest
		// when enabled, we insert a panner node: source -> gain -> panner -> dest
		
		// disabled and switching to enabled: reconnect the gain node via the panner node
		if (!this.pannerEnabled && enable_)
		{
			if (!this.gainNode)
				return;
			
			if (!this.pannerNode)
			{
				this.pannerNode = context["createPanner"]();
				
				// support older API versions
				if (typeof this.pannerNode["panningModel"] === "number")
					this.pannerNode["panningModel"] = panningModel;
				else
					this.pannerNode["panningModel"] = ["equalpower", "HRTF", "soundfield"][panningModel];
					
				if (typeof this.pannerNode["distanceModel"] === "number")
					this.pannerNode["distanceModel"] = distanceModel;
				else
					this.pannerNode["distanceModel"] = ["linear", "inverse", "exponential"][distanceModel];
					
				this.pannerNode["refDistance"] = refDistance;
				this.pannerNode["maxDistance"] = maxDistance;
				this.pannerNode["rolloffFactor"] = rolloffFactor;
			}
			
			this.gainNode["disconnect"]();
			this.gainNode["connect"](this.pannerNode);
			this.pannerNode["connect"](getDestinationForTag(this.tag));
			
			this.pannerEnabled = true;
		}
		
		// enabled and switching to disabled: leave the pannerNode, but route around it
		else if (this.pannerEnabled && !enable_)
		{
			if (!this.gainNode)
				return;
			
			this.pannerNode["disconnect"]();
			this.gainNode["disconnect"]();
			this.gainNode["connect"](getDestinationForTag(this.tag));
			
			this.pannerEnabled = false;
		}
	};
	
	C2AudioInstance.prototype.setPan = function (x, y, angle, innerangle, outerangle, outergain)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO)
			return;
			
		this.pannerNode["setPosition"](x, y, 0);
		this.pannerNode["setOrientation"](Math.cos(cr.to_radians(angle)), Math.sin(cr.to_radians(angle)), 0);
		this.pannerNode["coneInnerAngle"] = innerangle;
		this.pannerNode["coneOuterAngle"] = outerangle;
		this.pannerNode["coneOuterGain"] = outergain;
		
		this.panX = x;
		this.panY = y;
		this.panAngle = angle;
		this.panConeInner = innerangle;
		this.panConeOuter = outerangle;
		this.panConeOuterGain = outergain;
	};
	
	C2AudioInstance.prototype.setObject = function (o)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO)
			return;
			
		if (!this.objectTracker)
			this.objectTracker = new ObjectTracker();
			
		this.objectTracker.setObject(o);
	};
	
	C2AudioInstance.prototype.tick = function (dt)
	{
		if (!this.pannerEnabled || api !== API_WEBAUDIO || !this.objectTracker || !this.objectTracker.hasObject() || !this.isPlaying())
		{
			return;
		}
		
		this.objectTracker.tick(dt);
		var inst = this.objectTracker.obj;
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		this.pannerNode["setPosition"](px, py, 0);
		
		var a = 0;
		
		if (typeof this.objectTracker.obj.angle !== "undefined")
		{
			a = inst.angle - inst.layer.getAngle();
			this.pannerNode["setOrientation"](Math.cos(a), Math.sin(a), 0);
		}
	};
	
	C2AudioInstance.prototype.play = function (looping, vol, fromPosition, scheduledTime)
	{
		var instobj = this.instanceObject;
		this.looping = looping;
		this.volume = vol;
		var seekPos = fromPosition || 0;
		scheduledTime = scheduledTime || 0;
		
		switch (this.myapi) {
		case API_HTML5:
			
			// restore defaults
			
			if (instobj.playbackRate !== 1.0)
				instobj.playbackRate = 1.0;
				
			if (instobj.volume !== vol * masterVolume)
				instobj.volume = vol * masterVolume;
				
			if (instobj.loop !== looping)
				instobj.loop = looping;
				
			if (instobj.muted)
				instobj.muted = false;
			
			if (instobj.currentTime !== seekPos)
			{
				// no idea why this sometimes throws
				try {
					instobj.currentTime = seekPos;
				}
				catch (err)
				{
					log("Exception rewinding audio: " + err);
				}
			}
			
			tryPlayAudioElement(this);
				
			break;
		case API_WEBAUDIO:
			this.muted = false;
			this.mutevol = 1;
			
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				this.gainNode["gain"]["value"] = vol * masterVolume;
				
				// buffer sources are one-shot - make a new object second time around
				if (!this.fresh)
				{
					this.instanceObject = context["createBufferSource"]();
					this.instanceObject["buffer"] = this.buffer.bufferObject;
					this.instanceObject["connect"](this.gainNode);
				}
				
				this.instanceObject["onended"] = this.onended_handler;
				this.active_buffer = this.instanceObject;
				this.instanceObject.loop = looping;
				this.hasPlaybackEnded = false;
				
				if (seekPos === 0)
					startSource(this.instanceObject, scheduledTime);
				else
					startSourceAt(this.instanceObject, seekPos, this.getDuration(), scheduledTime);
			}
			else
			{
				if (instobj.playbackRate !== 1.0)
					instobj.playbackRate = 1.0;
				
				if (instobj.loop !== looping)
					instobj.loop = looping;
			
				instobj.volume = vol * masterVolume;
				
				if (instobj.currentTime !== seekPos)
				{
					// no idea why this sometimes throws
					try {
						instobj.currentTime = seekPos;
					}
					catch (err)
					{
						log("Exception rewinding audio: " + err);
					}
				}
				
				tryPlayAudioElement(this);
			}
			break;
		case API_CORDOVA:

			if ((!this.fresh && this.stopped) || seekPos !== 0)
				instobj["seekTo"](seekPos);
				
			instobj["play"]();
			this.hasPlaybackEnded = false;
			
			break;
			
		case API_APPMOBI:
		
			// only supports one shot throwaway sounds
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["playSound"](this.src, looping);
			else
				AppMobi["player"]["playSound"](this.src, looping);
				
			break;
		}
		
		this.playbackRate = 1;
		this.startTime = (this.isTimescaled ? audRuntime.kahanTime.sum : audRuntime.wallTime.sum) - seekPos;
		this.fresh = false;
		this.stopped = false;
		this.is_paused = false;
	};
	
	C2AudioInstance.prototype.stop = function ()
	{
		switch (this.myapi) {
		case API_HTML5:
			if (!this.instanceObject.paused)
				this.instanceObject.pause();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
				stopSource(this.instanceObject);
			else
			{
				if (!this.instanceObject.paused)
					this.instanceObject.pause();
			}
			break;
		case API_CORDOVA:
			this.instanceObject["stop"](); 
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["stopSound"](this.src);
			break;
		}
		
		this.stopped = true;
		this.is_paused = false;
	};
	
	C2AudioInstance.prototype.pause = function ()
	{
		if (this.fresh || this.stopped || this.hasEnded() || this.is_paused)
			return;
		
		switch (this.myapi) {
		case API_HTML5:
			if (!this.instanceObject.paused)
				this.instanceObject.pause();
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				// if buffer is looping, playback time may exceed the duration, and we
				// can't resume from somewhere after the duration. So wrap it back inside the duration.
				this.resume_position = this.getPlaybackTime(true);
				
				if (this.looping)
					this.resume_position = this.resume_position % this.getDuration();
				
				// Web Audio fires its "ended" event when stopped, but we want to ignore this when
				// pausing, so the is_paused flag is set first and the ended event ignores itself based on this.
				this.is_paused = true;
				stopSource(this.instanceObject);
			}
			else
			{
				if (!this.instanceObject.paused)
					this.instanceObject.pause();
			}
			break;
		case API_CORDOVA:
			this.instanceObject["pause"](); 
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["stopSound"](this.src);
			break;
		}
		
		this.is_paused = true;
	};
	
	C2AudioInstance.prototype.resume = function ()
	{
		if (this.fresh || this.stopped || this.hasEnded() || !this.is_paused)
			return;
		
		switch (this.myapi) {
		case API_HTML5:
			tryPlayAudioElement(this);
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				// resume by creating a new buffer source and playing from where it got paused
				this.instanceObject = context["createBufferSource"]();
				this.instanceObject["buffer"] = this.buffer.bufferObject;
				this.instanceObject["connect"](this.gainNode);
				this.instanceObject["onended"] = this.onended_handler;
				this.active_buffer = this.instanceObject;
				this.instanceObject.loop = this.looping;
				this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
				this.updatePlaybackRate();
				
				// set the start time back in time so it can still calculate the end time properly
				this.startTime = (this.isTimescaled ? audRuntime.kahanTime.sum : audRuntime.wallTime.sum) - (this.resume_position / (this.playbackRate || 0.001));
				startSourceAt(this.instanceObject, this.resume_position, this.getDuration());
			}
			else
			{
				tryPlayAudioElement(this);
			}
			break;
		case API_CORDOVA:
			this.instanceObject["play"](); 
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["resumeSound"](this.src);
			break;
		}
		
		this.is_paused = false;
	};
	
	C2AudioInstance.prototype.seek = function (pos)
	{
		if (this.fresh || this.stopped || this.hasEnded())
			return;
		
		switch (this.myapi) {
		case API_HTML5:
			try {
				this.instanceObject.currentTime = pos;
			}
			catch (e) {}
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.is_paused)
					this.resume_position = pos;
				else
				{
					// easiest thing to do is pause, change the resume position then resume
					this.pause();
					this.resume_position = pos;
					this.resume();
				}
			}
			else
			{
				try {
					this.instanceObject.currentTime = pos;
				}
				catch (e) {}
			}
			break;
		case API_CORDOVA:
			// not supported
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["seekSound"](this.src, pos);
			break;
		}
	};
	
	C2AudioInstance.prototype.reconnect = function (toNode)
	{
		if (this.myapi !== API_WEBAUDIO)
			return;
			
		if (this.pannerEnabled)
		{
			this.pannerNode["disconnect"]();
			this.pannerNode["connect"](toNode);
		}
		else
		{
			this.gainNode["disconnect"]();
			this.gainNode["connect"](toNode);
		}
	};
	
	C2AudioInstance.prototype.getDuration = function (applyPlaybackRate)
	{
		var ret = 0;
		
		switch (this.myapi) {
		case API_HTML5:
			if (typeof this.instanceObject.duration !== "undefined")
				ret = this.instanceObject.duration;
			break;
		case API_WEBAUDIO:
			ret = this.buffer.bufferObject["duration"];
			break;
		case API_CORDOVA:
			ret = this.instanceObject["getDuration"]();
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				ret = AppMobi["context"]["getDurationSound"](this.src);
			break;
		}
		
		if (applyPlaybackRate)
			ret /= (this.playbackRate || 0.001);		// avoid divide-by-zero
		
		return ret;
	};
	
	C2AudioInstance.prototype.getPlaybackTime = function (applyPlaybackRate)
	{
		var duration = this.getDuration();
		var ret = 0;
		
		switch (this.myapi) {
		case API_HTML5:
			if (typeof this.instanceObject.currentTime !== "undefined")
				ret = this.instanceObject.currentTime;
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.is_paused)
					return this.resume_position;
				else
					ret = (this.isTimescaled ? audRuntime.kahanTime.sum : audRuntime.wallTime.sum) - this.startTime;
			}
			else if (typeof this.instanceObject.currentTime !== "undefined")
				ret = this.instanceObject.currentTime;
			break;
		case API_CORDOVA:
			// not supported synchronously
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				ret = AppMobi["context"]["getPlaybackTimeSound"](this.src);
			break;
		}
		
		// compensate by current playback rate (note: does not take in to account past changes)
		if (applyPlaybackRate)
			ret *= this.playbackRate;
		
		// clamp to buffer duration if not looping, otherwise keep counting up
		if (!this.looping && ret > duration)
			ret = duration;
		
		return ret;
	};
	
	C2AudioInstance.prototype.isPlaying = function ()
	{
		return !this.is_paused && !this.fresh && !this.stopped && !this.hasEnded();
	};
	
	C2AudioInstance.prototype.shouldSave = function ()
	{
		// save sounds which are playing, but include paused ones
		return !this.fresh && !this.stopped && !this.hasEnded();
	};
	
	C2AudioInstance.prototype.setVolume = function (v)
	{
		this.volume = v;
		this.updateVolume();
	};
	
	C2AudioInstance.prototype.updateVolume = function ()
	{
		var volToSet = this.volume * masterVolume;
		
		if (!isFinite(volToSet))
			volToSet = 0;		// HTMLMediaElement throws if setting non-finite volume
		
		switch (this.myapi) {
		case API_HTML5:
			// ff 3.6 doesn't seem to have this property
			if (typeof this.instanceObject.volume !== "undefined" && this.instanceObject.volume !== volToSet)
				this.instanceObject.volume = volToSet;
			break;
		case API_WEBAUDIO:
			// Work around an apparent bug in Chrome for Android: for some reason setting the gain node volume
			// here has no effect when connected to a MediaSourceNode. To work around, set the volume on the
			// audio element feeding audio in to the MediaSourceNode.
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				this.gainNode["gain"]["value"] = volToSet * this.mutevol;
			}
			else
			{
				if (typeof this.instanceObject.volume !== "undefined" && this.instanceObject.volume !== volToSet)
					this.instanceObject.volume = volToSet;
			}
			
			break;
		case API_CORDOVA:
			// not supported
			break;
		case API_APPMOBI:
			// not supported
			break;
		}
	};
	
	C2AudioInstance.prototype.getVolume = function ()
	{
		return this.volume;
	};
	
	C2AudioInstance.prototype.doSetMuted = function (m)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.muted !== !!m)
				this.instanceObject.muted = !!m;
			break;
		case API_WEBAUDIO:
			// Due to the same workaround in updateVolume, mute the underlying audio source when using
			// MediaSourceNodes.
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				this.mutevol = (m ? 0 : 1);
				this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
			}
			else
			{
				if (this.instanceObject.muted !== !!m)
					this.instanceObject.muted = !!m;
			}
			break;
		case API_CORDOVA:
			// not supported
			break;
		case API_APPMOBI:
			// not supported
			break;
		}
	};
	
	C2AudioInstance.prototype.setMuted = function (m)
	{
		this.is_muted = !!m;
		
		this.doSetMuted(this.is_muted || this.is_silent);
	};
	
	C2AudioInstance.prototype.setSilent = function (m)
	{
		this.is_silent = !!m;
		
		this.doSetMuted(this.is_muted || this.is_silent);
	};
	
	C2AudioInstance.prototype.setLooping = function (l)
	{
		this.looping = l;
		
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_WEBAUDIO:
			if (this.instanceObject.loop !== !!l)
				this.instanceObject.loop = !!l;
			break;
		case API_CORDOVA:
			// not supported
			break;
		case API_APPMOBI:
			if (audRuntime.isDirectCanvas)
				AppMobi["context"]["setLoopingSound"](this.src, l);
			break;
		}
	};
	
	C2AudioInstance.prototype.setPlaybackRate = function (r)
	{
		this.playbackRate = r;
		
		this.updatePlaybackRate();
	};
	
	C2AudioInstance.prototype.updatePlaybackRate = function ()
	{
		var r = this.playbackRate;
		
		if (this.isTimescaled)
			r *= audRuntime.timescale;
			
		switch (this.myapi) {
		case API_HTML5:
			if (this.instanceObject.playbackRate !== r)
				this.instanceObject.playbackRate = r;
			break;
		case API_WEBAUDIO:
			if (this.buffer.myapi === API_WEBAUDIO)
			{
				if (this.instanceObject["playbackRate"]["value"] !== r)
					this.instanceObject["playbackRate"]["value"] = r;
			}
			else
			{
				if (this.instanceObject.playbackRate !== r)
					this.instanceObject.playbackRate = r;
			}
			break;
		case API_CORDOVA:
			// not supported
			break;
		case API_APPMOBI:
			// not supported
			break;
		}
	};
	
	C2AudioInstance.prototype.setSuspended = function (s)
	{
		switch (this.myapi) {
		case API_HTML5:
			if (s)
			{
				// Pause if playing
				if (this.isPlaying())
				{
					this.resume_me = true;
					this.instanceObject["pause"]();
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
				{
					this.instanceObject["play"]();
					this.resume_me = false;
				}
			}
			
			break;
		case API_WEBAUDIO:
		
			if (s)
			{
				if (this.isPlaying())
				{
					this.resume_me = true;
					
					if (this.buffer.myapi === API_WEBAUDIO)
					{
						// if buffer is looping, playback time may exceed the duration, and we
						// can't resume from somewhere after the duration. So wrap it back inside the duration.
						this.resume_position = this.getPlaybackTime(true);
						
						if (this.looping)
							this.resume_position = this.resume_position % this.getDuration();
						
						stopSource(this.instanceObject);
					}
					else
						this.instanceObject["pause"]();
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
				{
					if (this.buffer.myapi === API_WEBAUDIO)
					{
						// resume by creating a new buffer source and playing from where it got paused
						this.instanceObject = context["createBufferSource"]();
						this.instanceObject["buffer"] = this.buffer.bufferObject;
						this.instanceObject["connect"](this.gainNode);
						this.instanceObject["onended"] = this.onended_handler;
						this.active_buffer = this.instanceObject;
						this.instanceObject.loop = this.looping;
						this.gainNode["gain"]["value"] = masterVolume * this.volume * this.mutevol;
						this.updatePlaybackRate();
						
						// set the start time back in time so it can still calculate the end time properly
						this.startTime = (this.isTimescaled ? audRuntime.kahanTime.sum : audRuntime.wallTime.sum) - (this.resume_position / (this.playbackRate || 0.001));
						startSourceAt(this.instanceObject, this.resume_position, this.getDuration());
					}
					else
					{
						this.instanceObject["play"]();
					}
					
					this.resume_me = false;
				}					
			}
			
			break;
		case API_CORDOVA:
		
			if (s)
			{
				// Pause if playing
				if (this.isPlaying())
				{
					this.instanceObject["pause"]();
					this.resume_me = true;
				}
				else
					this.resume_me = false;
			}
			else
			{
				if (this.resume_me)
				{
					this.resume_me = false;
					this.instanceObject["play"]();
				}
			}
			
			break;
			
		case API_APPMOBI:
			// not supported
			break;
		}
	};
	
	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		audRuntime = this.runtime;
		audInst = this;
		this.listenerTracker = null;
		this.listenerZ = -600;
		
		// WKWebView can't load HTML audio in any sensible way, since it cannot load from a file: or a
		// blob: URL. Only a data URL works, but then we may as well just use the Web Audio API
		// and load music in to an entire buffer, since data URLs are probably even worse.
		// So for WKWebView the playMusicAsSoundWorkaround flag is specified.
		if (this.runtime.isWKWebView)
			playMusicAsSoundWorkaround = true;
		
		// Work around iOS & Android's requirement of having a user gesture start playback.
		// This is only used as a fall-back heuristic if play() does not return a Promise.
		// Note: skip this workaround if playing music as sound, since the Web Audio API is not affected by this limitation.
		if ((this.runtime.isiOS || (this.runtime.isAndroid && (this.runtime.isChrome || this.runtime.isAndroidStockBrowser))) && !this.runtime.isCrosswalk && !this.runtime.isDomFree && !this.runtime.isAmazonWebApp && !playMusicAsSoundWorkaround)
		{
			useNextTouchWorkaround = true;
		}
		
		// Use APIs in order:
		// Always use Web Audio API if supported
		// Then Cordova Media if Web Audio API not supported and in Cordova
		// Then AppMobi player if Web Audio API not supported and in AppMobi
		// Then leave default (HTML5)
		
		context = null;

		if (typeof AudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new AudioContext();
		}
		else if (typeof webkitAudioContext !== "undefined")
		{
			api = API_WEBAUDIO;
			context = new webkitAudioContext();
		}
		
		// Horrifying Safari iOS 9.2 bug: audio contexts can come back with the wrong sampling rate. Try to fix this
		// by hackily forcibly closing the audio context and recreating it.
		if (this.runtime.isiOS && context)
		{
			if (context.close)
				context.close();
			
			if (typeof AudioContext !== "undefined")
				context = new AudioContext();
			else if (typeof webkitAudioContext !== "undefined")
				context = new webkitAudioContext();
		}
			
		if (api !== API_WEBAUDIO)
		{
			// If using cordova check we really have Media objects (the permission may have been disabled)
			if (this.runtime.isCordova && typeof window["Media"] !== "undefined")
				api = API_CORDOVA;
			else if (this.runtime.isAppMobi)
				api = API_APPMOBI;
			// else leave as HTML5
		}
		
		// Cordova needs to know where to find files
		if (api === API_CORDOVA)
		{
			appPath = location.href;
			
			var i = appPath.lastIndexOf("/");
			
			if (i > -1)
				appPath = appPath.substr(0, i + 1);
				
			appPath = appPath.replace("file://", "");
		}
		
		// Detect Safari for Windows with no Quicktime installed, which crashes since Audio becomes undefined
		if (this.runtime.isSafari && this.runtime.isWindows && typeof Audio === "undefined")
		{
			alert("It looks like you're using Safari for Windows without Quicktime.  Audio cannot be played until Quicktime is installed.");
			this.runtime.DestroyInstance(this);
		}
		else
		{
			// Determine whether to use OGG
			if (this.runtime.isDirectCanvas)
				useOgg = this.runtime.isAndroid;		// AAC on iOS, OGG on Android
			else
			{
				// The canPlayType() call mysteriously sometimes throws a 'not implemented' exception
				// on IE for Windows 8 apps.  Let's just ignore that if it happens.
				try {
					// NOTE: Windows 10 build 17134 adds support for Ogg Vorbis playback, but Windows Store apps are only exported with
					// AAC in C2. So make sure we don't enable useOgg in Windows Store apps.
					useOgg = !!(new Audio().canPlayType('audio/ogg; codecs="vorbis"')) &&
								!this.runtime.isWindows10;
				}
				catch (e)
				{
					useOgg = false;
				}
			}
		
			switch (api) {
			case API_HTML5:
				log("Using HTML5 Audio API, useOgg = " + useOgg);
				break;
			case API_WEBAUDIO:
				log("Using Web Audio API, useOgg = " + useOgg);
				break;
			case API_CORDOVA:
				log("Using Cordova Audio API, useOgg = " + useOgg);
				break;
			case API_APPMOBI:
				log("Using AppMobi Player API, useOgg = " + useOgg);
				break;
			default:
				assert2("Unknown audio API, useOgg = " + useOgg);
			}
			
		// Tick to fire 'on ended' for Web Audio API/Cordova, and keep timescale up to date
		this.runtime.tickMe(this);
		}
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	
	instanceProto.onCreate = function ()
	{
		this.runtime.audioInstance = this;
		
		timescale_mode = this.properties[0];	// 0 = off, 1 = sounds only, 2 = all
		this.saveload = this.properties[1];		// 0 = all, 1 = sounds only, 2 = music only, 3 = none
		this.playinbackground = (this.properties[2] !== 0);
		this.nextPlayTime = 0;
		
		panningModel = this.properties[3];		// 0 = equalpower, 1 = hrtf, 3 = soundfield
		distanceModel = this.properties[4];		// 0 = linear, 1 = inverse, 2 = exponential
		this.listenerZ = -this.properties[5];
		refDistance = this.properties[6];
		maxDistance = this.properties[7];
		rolloffFactor = this.properties[8];
		
		this.listenerTracker = new ObjectTracker();
		
		var draw_width = (this.runtime.draw_width || this.runtime.width);
		var draw_height = (this.runtime.draw_height || this.runtime.height);
		
		if (api === API_WEBAUDIO)
		{
			context["listener"]["setPosition"](draw_width / 2, draw_height / 2, this.listenerZ);
			context["listener"]["setOrientation"](0, 0, 1, 0, -1, 0);
			
			// Add function for User Media object to call when mic input is received
			window["c2OnAudioMicStream"] = function (localMediaStream, tag)
			{
				if (micSource)
					micSource["disconnect"]();
				
				micTag = tag.toLowerCase();
				micSource = context["createMediaStreamSource"](localMediaStream);
				micSource["connect"](getDestinationForTag(micTag));
			};
		}
		
		this.runtime.addSuspendCallback(function(s)
		{
			audInst.onSuspend(s);
		});
		
		var self = this;
		this.runtime.addDestroyCallback(function (inst)
		{
			self.onInstanceDestroyed(inst);
		});
	};
	
	instanceProto.onInstanceDestroyed = function (inst)
	{
		// Remove instance from any object trackers
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			
			if (a.objectTracker)
			{
				if (a.objectTracker.obj === inst)
				{
					a.objectTracker.obj = null;
				
					// Stop any looping sounds attached to objects
					if (a.pannerEnabled && a.isPlaying() && a.looping)
						a.stop();
				}
			}
		}
		
		if (this.listenerTracker.obj === inst)
			this.listenerTracker.obj = null;
	};
	
	instanceProto.saveToJSON = function ()
	{
		var o = {
			"silent": silent,
			"masterVolume": masterVolume,
			"listenerZ": this.listenerZ,
			"listenerUid": this.listenerTracker.hasObject() ? this.listenerTracker.obj.uid : -1,
			"playing": [],
			"effects": {}
		};
		
		var playingarr = o["playing"];
		
		var i, len, a, d, p, panobj, playbackTime;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			
			if (!a.shouldSave())
				continue;				// no need to save stopped sounds
			
			if (this.saveload === 3)	// not saving/loading any sounds/music
				continue;
			if (a.is_music && this.saveload === 1)	// not saving/loading music
				continue;
			if (!a.is_music && this.saveload === 2)	// not saving/loading sound
				continue;
			
			playbackTime = a.getPlaybackTime();
			
			if (a.looping)
				playbackTime = playbackTime % a.getDuration();
			
			d = {
				"tag": a.tag,
				"buffersrc": a.buffer.src,
				"is_music": a.is_music,
				"playbackTime": playbackTime,
				"volume": a.volume,
				"looping": a.looping,
				"muted": a.is_muted,
				"playbackRate": a.playbackRate,
				"paused": a.is_paused,
				"resume_position": a.resume_position
			};
			
			if (a.pannerEnabled)
			{
				d["pan"] = {};
				panobj = d["pan"];
				
				if (a.objectTracker && a.objectTracker.hasObject())
				{
					panobj["objUid"] = a.objectTracker.obj.uid;
				}
				else
				{
					panobj["x"] = a.panX;
					panobj["y"] = a.panY;
					panobj["a"] = a.panAngle;
				}
				
				panobj["ia"] = a.panConeInner;
				panobj["oa"] = a.panConeOuter;
				panobj["og"] = a.panConeOuterGain;
			}
			
			playingarr.push(d);
		}
		
		var fxobj = o["effects"];
		var fxarr;
		
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				fxarr = [];
				
				for (i = 0, len = effects[p].length; i < len; i++)
				{
					fxarr.push({ "type": effects[p][i].type, "params": effects[p][i].params });
				}
				
				fxobj[p] = fxarr;
			}
		}
		
		return o;
	};
	
	var objectTrackerUidsToLoad = [];
	
	instanceProto.loadFromJSON = function (o)
	{
		var setSilent = o["silent"];
		masterVolume = o["masterVolume"];
		this.listenerZ = o["listenerZ"];
		
		this.listenerTracker.setObject(null);
		var listenerUid = o["listenerUid"];
		if (listenerUid !== -1)
		{
			this.listenerTracker.loadUid = listenerUid;
			objectTrackerUidsToLoad.push(this.listenerTracker);
		}
		
		var playingarr = o["playing"];
		
		var i, len, d, src, is_music, tag, playbackTime, looping, vol, b, a, p, pan, panObjUid;
		
		// Stop all current audio that is being saved/loaded
		if (this.saveload !== 3)
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
			{
				a = audioInstances[i];
				
				if (a.is_music && this.saveload === 1)
					continue;		// only saving/loading sound: leave music playing
				if (!a.is_music && this.saveload === 2)
					continue;		// only saving/loading music: leave sound playing
				
				a.stop();
			}
		}
		
		// Load effects
		var fxarr, fxtype, fxparams, fx;
		
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				for (i = 0, len = effects[p].length; i < len; i++)
					effects[p][i].remove();
			}
		}
		
		cr.wipe(effects);
		
		for (p in o["effects"])
		{
			if (o["effects"].hasOwnProperty(p))
			{
				fxarr = o["effects"][p];
				
				for (i = 0, len = fxarr.length; i < len; i++)
				{
					fxtype = fxarr[i]["type"];
					fxparams = fxarr[i]["params"];
					
					switch (fxtype) {
					case "filter":
						addEffectForTag(p, new FilterEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4], fxparams[5]));
						break;
					case "delay":
						addEffectForTag(p, new DelayEffect(fxparams[0], fxparams[1], fxparams[2]));
						break;
					case "convolve":
						src = fxparams[2];
						b = this.getAudioBuffer(src, false);
						
						// buffer loaded
						if (b.bufferObject)
						{
							fx = new ConvolveEffect(b.bufferObject, fxparams[0], fxparams[1], src);
						}
						// else assign once loaded
						else
						{
							fx = new ConvolveEffect(null, fxparams[0], fxparams[1], src);
							b.normalizeWhenReady = fxparams[0];
							b.convolveWhenReady = fx;
						}
						
						addEffectForTag(p, fx);
						break;
					case "flanger":
						addEffectForTag(p, new FlangerEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "phaser":
						addEffectForTag(p, new PhaserEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4], fxparams[5]));
						break;
					case "gain":
						addEffectForTag(p, new GainEffect(fxparams[0]));
						break;
					case "tremolo":
						addEffectForTag(p, new TremoloEffect(fxparams[0], fxparams[1]));
						break;
					case "ringmod":
						addEffectForTag(p, new RingModulatorEffect(fxparams[0], fxparams[1]));
						break;
					case "distortion":
						addEffectForTag(p, new DistortionEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "compressor":
						addEffectForTag(p, new CompressorEffect(fxparams[0], fxparams[1], fxparams[2], fxparams[3], fxparams[4]));
						break;
					case "analyser":
						addEffectForTag(p, new AnalyserEffect(fxparams[0], fxparams[1]));
						break;
					}
				}
			}
		}
		
		for (i = 0, len = playingarr.length; i < len; i++)
		{
			if (this.saveload === 3)	// not saving/loading any sounds/music
				continue;
			
			d = playingarr[i];
			src = d["buffersrc"];
			is_music = d["is_music"];
			tag = d["tag"];
			playbackTime = d["playbackTime"];
			looping = d["looping"];
			vol = d["volume"];
			pan = d["pan"];
			panObjUid = (pan && pan.hasOwnProperty("objUid")) ? pan["objUid"] : -1;
			
			if (is_music && this.saveload === 1)	// not saving/loading music
				continue;
			if (!is_music && this.saveload === 2)	// not saving/loading sound
				continue;
			
			a = this.getAudioInstance(src, tag, is_music, looping, vol);
		
			if (!a)
			{
				// tell buffer to do this panning when ready
				b = this.getAudioBuffer(src, is_music);
				b.seekWhenReady = playbackTime;
				b.pauseWhenReady = d["paused"];
				
				if (pan)
				{
					if (panObjUid !== -1)
					{
						b.panWhenReady.push({ objUid: panObjUid, ia: pan["ia"], oa: pan["oa"], og: pan["og"], thistag: tag });
					}
					else
					{
						b.panWhenReady.push({ x: pan["x"], y: pan["y"], a: pan["a"], ia: pan["ia"], oa: pan["oa"], og: pan["og"], thistag: tag });
					}
				}
				
				continue;
			}
			
			a.resume_position = d["resume_position"];
			a.setPannerEnabled(!!pan);
			a.play(looping, vol, playbackTime);
			a.updatePlaybackRate();
			a.updateVolume();
			a.doSetMuted(a.is_muted || a.is_silent);
			
			if (d["paused"])
				a.pause();
				
			if (d["muted"])
				a.setMuted(true);
			
			a.doSetMuted(a.is_muted || a.is_silent);
			
			if (pan)
			{
				if (panObjUid !== -1)
				{
					a.objectTracker = a.objectTracker || new ObjectTracker();
					a.objectTracker.loadUid = panObjUid;
					objectTrackerUidsToLoad.push(a.objectTracker);
				}
				else
				{
					a.setPan(pan["x"], pan["y"], pan["a"], pan["ia"], pan["oa"], pan["og"]);
				}
			}
		}
		
		if (setSilent && !silent)			// setting silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(true);
			
			silent = true;
		}
		else if (!setSilent && silent)		// setting not silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(false);
			
			silent = false;
		}
	};
	
	instanceProto.afterLoad = function ()
	{
		// Update all object trackers that need to look up UIDs
		var i, len, ot, inst;
		for (i = 0, len = objectTrackerUidsToLoad.length; i < len; i++)
		{
			ot = objectTrackerUidsToLoad[i];
			inst = this.runtime.getObjectByUID(ot.loadUid);
			ot.setObject(inst);
			ot.loadUid = -1;
			
			if (inst)
			{
				listenerX = inst.x;
				listenerY = inst.y;
			}
		}
		
		cr.clearArray(objectTrackerUidsToLoad);
	};
	
	instanceProto.onSuspend = function (s)
	{
		// ignore suspend/resume events if set to play in background - normally
		// everything is paused in response to a suspend event
		if (this.playinbackground)
			return;
		
		// upon resume: first resume the whole context
		if (!s && context && context["resume"])
		{
			context["resume"]();
			isContextSuspended = false;
		}
		
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].setSuspended(s);
		
		// after suspend: also suspend the whole context
		if (s && context && context["suspend"])
		{
			context["suspend"]();
			isContextSuspended = true;
		}
	};
	
	instanceProto.tick = function ()
	{
		var dt = this.runtime.dt;
		
		// Check for audio instances which have finished and trigger OnEnded as appropriate
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			a.tick(dt);
			
			// Update time scales
			if (timescale_mode !== 0)
				a.updatePlaybackRate();
		}
		
		// keep flanger/phaser effects cycling
		var p, arr, f;
		for (p in effects)
		{
			if (effects.hasOwnProperty(p))
			{
				arr = effects[p];
				for (i = 0, len = arr.length; i < len; i++)
				{
					f = arr[i];
					if (f.tick)
						f.tick();
				}
			}
		}
		
		// keep listener up to date
		if (api === API_WEBAUDIO && this.listenerTracker.hasObject())
		{
			this.listenerTracker.tick(dt);
			listenerX = this.listenerTracker.obj.x;
			listenerY = this.listenerTracker.obj.y;
			context["listener"]["setPosition"](this.listenerTracker.obj.x, this.listenerTracker.obj.y, this.listenerZ);
		}
	};
	
	// For preloading audio at project start
	var preload_list = [];
	
	instanceProto.setPreloadList = function (arr)
	{
		var i, len, p, filename, size, isOgg;
		var total_size = 0;
		
		// Only preload the oggs or m4as depending on the browser support
		for (i = 0, len = arr.length; i < len; ++i)
		{
			p = arr[i];
			filename = p[0];
			
			// Double the reported size of the audio tracks. Audio has the additional step of needing
			// decoding after downloading, which images don't have to do, so audio should be more highly
			// represented in the loading bar. Downloaded but not yet decoded audio is reported as half
			// progress, so this actually reports downloading audio with the same weight as downloading
			// images, but with an additional decode job after it of the same size.
			size = p[1] * 2;
			
			isOgg = (filename.length > 4 && filename.substr(filename.length - 4) === ".ogg");
			
			if ((isOgg && useOgg) || (!isOgg && !useOgg))
			{
				preload_list.push({
					filename: filename,
					size: size,
					obj: null
				});
				
				total_size += size;
			}
		}
		
		return total_size;
	};
	
	instanceProto.startPreloads = function ()
	{
		var i, len, p, src;
		for (i = 0, len = preload_list.length; i < len; ++i)
		{
			p = preload_list[i];
			src = this.runtime.files_subfolder + p.filename;
			p.obj = this.getAudioBuffer(src, false);
		}
	};
	
	instanceProto.getPreloadedSize = function ()
	{
		var completed = 0;
		
		var i, len, p;
		for (i = 0, len = preload_list.length; i < len; ++i)
		{
			p = preload_list[i];
			
			// still count files that have failed to load, otherwise the loading progress hangs
			// don't trust dom-free engines to report this correctly
			// don't trust Android stock browser to report this correctly (see https://www.scirra.com/forum/audio-causes-android-browser-to-hang-r178_t114743)
			if (p.obj.isLoadedAndDecoded() || p.obj.hasFailedToLoad() || this.runtime.isDomFree || this.runtime.isAndroidStockBrowser)
			{
				completed += p.size;
			}
			else if (p.obj.isLoaded())	// downloaded but not decoded: only happens in Web Audio API, count as half-way progress
			{
				completed += Math.floor(p.size / 2);
			}
		};
		
		return completed;
	};
	
	instanceProto.releaseAllMusicBuffers = function ()
	{
		var i, len, j, b;
		
		for (i = 0, j = 0, len = audioBuffers.length; i < len; ++i)
		{
			b = audioBuffers[i];
			audioBuffers[j] = b;
			
			if (b.is_music)
				b.release();
			else
				++j;		// keep
		}
		
		audioBuffers.length = j;
	};
	
	// find an existing audio buffer for the given source, else create a new one and return that
	instanceProto.getAudioBuffer = function (src_, is_music, dont_create)
	{
		var i, len, a, ret = null, j, k, lenj, ai;
		
		// Try to find existing buffer with same source
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			a = audioBuffers[i];
			
			if (a.src === src_)
			{
				ret = a;
				break;
			}
		}
		
		// Couldn't find it - add a new one and return it, unless dont_create is set.
		if (!ret && !dont_create)
		{
			// If playing music as sound, release all the old music buffers before adding a new music buffer.
			// This prevents decompressed music tracks accumulating in memory.
			if (playMusicAsSoundWorkaround && is_music)
				this.releaseAllMusicBuffers();
			
			ret = new C2AudioBuffer(src_, is_music);
			audioBuffers.push(ret);
		}
		
		return ret;
	};
	
	instanceProto.getAudioInstance = function (src_, tag, is_music, looping, vol)
	{
		var i, len, a;
		
		// Try to find existing recyclable instance from the same source
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			
			if (a.src === src_ && (a.canBeRecycled() || is_music))
			{
				a.tag = tag;
				return a;
			}
		}
		
		// Otherwise create a new instance
		var b = this.getAudioBuffer(src_, is_music);
		
		// Not yet ready
		if (!b.bufferObject)
		{
			// Play once received
			if (tag !== "<preload>")
			{
				b.playTagWhenReady = tag;
				b.loopWhenReady = looping;
				b.volumeWhenReady = vol;
			}
				
			return null;
		}
			
		a = new C2AudioInstance(b, tag);
		audioInstances.push(a);
		return a;
	};
	
	var taggedAudio = [];
	
	function SortByIsPlaying(a, b)
	{
		var an = a.isPlaying() ? 1 : 0;
		var bn = b.isPlaying() ? 1 : 0;
		
		if (an === bn)
			return 0;
		else if (an < bn)
			return 1;
		else
			return -1;
	};
	
	function getAudioByTag(tag, sort_by_playing)
	{
		cr.clearArray(taggedAudio);
		
		// Empty tag: return last audio, if playing
		if (!tag.length)
		{
			if (!lastAudio || lastAudio.hasEnded())
				return;
			else
			{
				cr.clearArray(taggedAudio);
				taggedAudio[0] = lastAudio;
				return;
			}
		}
		
		var i, len, a;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			a = audioInstances[i];
			
			if (cr.equals_nocase(tag, a.tag))
				taggedAudio.push(a);
		}
		
		if (sort_by_playing)
			taggedAudio.sort(SortByIsPlaying);
	};
	
	function reconnectEffects(tag)
	{
		var i, len, arr, n, toNode = context["destination"];
		
		if (effects.hasOwnProperty(tag))
		{
			arr = effects[tag];
			
			if (arr.length)
			{
				toNode = arr[0].getInputNode();
				
				for (i = 0, len = arr.length; i < len; i++)
				{
					n = arr[i];
					
					// last node connects to destination
					if (i + 1 === len)
						n.connectTo(context["destination"]);
					// otherwise connect to next effects
					else
						n.connectTo(arr[i + 1].getInputNode());
				}
			}
		}
		
		getAudioByTag(tag);
		
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].reconnect(toNode);
		
		// Reconnect microphone input if active
		if (micSource && micTag === tag)
		{
			micSource["disconnect"]();
			micSource["connect"](toNode);
		}
	};
	
	function addEffectForTag(tag, fx)
	{
		if (!effects.hasOwnProperty(tag))
			effects[tag] = [fx];
		else
			effects[tag].push(fx);
			
		reconnectEffects(tag);
	};
	
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		var props = [];
		
		var i, len, a, p, valuestr = "", playingcount = 0;
		
		for (p in effects)
		{
			if (effects.hasOwnProperty(p) && effects[p].length)
			{
				valuestr = "";
				
				for (i = 0, len = effects[p].length; i < len; ++i)
				{
					valuestr += effects[p][i].type;
					
					if (i < len - 1)
						valuestr += " -> ";
				}
				
				props.push({"name": "Tag '" + p + "' effects", "value": valuestr, "readonly": true});
			}
		}
		
		if (props.length)
		{
			propsections.push({
				"title": "Effects",
				"properties": props
			});
		}
		
		valuestr = "";
		
		for (i = 0, len = audioInstances.length; i < len; ++i)
		{
			a = audioInstances[i];
			
			if (!a.isPlaying())
				continue;
				
			playingcount++;
			valuestr += "<strong>" + a.src + "</strong>";
			
			if (a.tag.length)
				valuestr += " (tag <em>" + a.tag + "</em>)";
			
			valuestr += ": " + (Math.round(a.getPlaybackTime(true) * 100) / 100) + " s / " + (Math.round(a.getDuration() * 100) / 100) + " s<br/>";
		}
		
		valuestr = playingcount.toString() + " playing" + (playingcount > 0 ? ":" : "") + "<br/>" + valuestr;
		
		propsections.push({
			"title": "Audio",
			"properties": [
				{"name": "Audio engine", "value": api === API_WEBAUDIO ? "Web Audio API" : "HTML5 audio", "readonly": true},
				{"name": "Currently playing", "value": valuestr, "html": true, "readonly": true}
			]
		});
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {};
	
	Cnds.prototype.OnEnded = function (t)
	{
		return cr.equals_nocase(audTag, t);
	};
	
	Cnds.prototype.PreloadsComplete = function ()
	{
		var i, len;
		for (i = 0, len = audioBuffers.length; i < len; i++)
		{
			if (!audioBuffers[i].isLoadedAndDecoded() && !audioBuffers[i].hasFailedToLoad())
				return false;
		}
		
		return true;
	};
	
	Cnds.prototype.AdvancedAudioSupported = function ()
	{
		return api === API_WEBAUDIO;
	};
	
	Cnds.prototype.IsSilent = function ()
	{
		return silent;
	};
	
	Cnds.prototype.IsAnyPlaying = function ()
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
		{
			if (audioInstances[i].isPlaying())
				return true;
		}
		
		return false;
	};
	
	Cnds.prototype.IsTagPlaying = function (tag)
	{
		getAudioByTag(tag);
		
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			if (taggedAudio[i].isPlaying())
				return true;
		}
		
		return false;
	};
	
	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.PlayAtPath = function(path, looping, vol, tag){
		if (silent)
			return;
			
		// Convert dB to linear scale
		var v = dbToLinear(vol);
			
		var is_music = true;
		var src = path;
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		
		if (!lastAudio)
			return;
		
		lastAudio.setPannerEnabled(false);
		lastAudio.play(looping!==0, v, 0, this.nextPlayTime);
		
		this.nextPlayTime = 0;
	}

	Acts.prototype.Play = function (file, looping, vol, tag)
	{
		console.log(file);
		if (silent)
			return;
			
		// Convert dB to linear scale
		var v = dbToLinear(vol);
			
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		
		if (!lastAudio)
			return;
		
		lastAudio.setPannerEnabled(false);
		lastAudio.play(looping!==0, v, 0, this.nextPlayTime);
		
		this.nextPlayTime = 0;
	};
	
	Acts.prototype.PlayAtPosition = function (file, looping, vol, x_, y_, angle_, innerangle_, outerangle_, outergain_, tag)
	{
		if (silent)
			return;
			
		// Convert dB to linear scale
		var v = dbToLinear(vol);
			
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		
		if (!lastAudio)
		{
			// tell buffer to do this panning when ready
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ x: x_, y: y_, a: angle_, ia: innerangle_, oa: outerangle_, og: dbToLinear(outergain_), thistag: tag });
			return;
		}
		
		lastAudio.setPannerEnabled(true);
		lastAudio.setPan(x_, y_, angle_, innerangle_, outerangle_, dbToLinear(outergain_));
		lastAudio.play(looping!==0, v, 0, this.nextPlayTime);
		
		this.nextPlayTime = 0;
	};
	
	Acts.prototype.PlayAtObject = function (file, looping, vol, obj, innerangle, outerangle, outergain, tag)
	{
		if (silent || !obj)
			return;
			
		var inst = obj.getFirstPicked();
		if (!inst)
			return;
			
		// Convert dB to linear scale
		var v = dbToLinear(vol);
			
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		
		if (!lastAudio)
		{
			// tell buffer to do this panning when ready
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ obj: inst, ia: innerangle, oa: outerangle, og: dbToLinear(outergain), thistag: tag });
			return;
		}
		
		lastAudio.setPannerEnabled(true);
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		lastAudio.setPan(px, py, cr.to_degrees(inst.angle - inst.layer.getAngle()), innerangle, outerangle, dbToLinear(outergain));
		lastAudio.setObject(inst);
		lastAudio.play(looping!==0, v, 0, this.nextPlayTime);
		
		this.nextPlayTime = 0;
	};
	
	Acts.prototype.PlayByName = function (folder, filename, looping, vol, tag)
	{
		if (silent)
			return;
			
		// Convert dB to linear scale
		var v = dbToLinear(vol);
			
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		
		if (!lastAudio)
			return;
		
		lastAudio.setPannerEnabled(false);
		lastAudio.play(looping!==0, v, 0, this.nextPlayTime);
		
		this.nextPlayTime = 0;
	};
	
	Acts.prototype.PlayAtPositionByName = function (folder, filename, looping, vol, x_, y_, angle_, innerangle_, outerangle_, outergain_, tag)
	{
		if (silent)
			return;
			
		// Convert dB to linear scale
		var v = dbToLinear(vol);
			
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		
		if (!lastAudio)
		{
			// tell buffer to do this panning when ready
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ x: x_, y: y_, a: angle_, ia: innerangle_, oa: outerangle_, og: dbToLinear(outergain_), thistag: tag });
			return;
		}
		
		lastAudio.setPannerEnabled(true);
		lastAudio.setPan(x_, y_, angle_, innerangle_, outerangle_, dbToLinear(outergain_));
		lastAudio.play(looping!==0, v, 0, this.nextPlayTime);
		
		this.nextPlayTime = 0;
	};
	
	Acts.prototype.PlayAtObjectByName = function (folder, filename, looping, vol, obj, innerangle, outerangle, outergain, tag)
	{
		if (silent || !obj)
			return;
			
		var inst = obj.getFirstPicked();
		if (!inst)
			return;
			
		// Convert dB to linear scale
		var v = dbToLinear(vol);
			
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		lastAudio = this.getAudioInstance(src, tag, is_music, looping!==0, v);
		
		if (!lastAudio)
		{
			// tell buffer to do this panning when ready
			var b = this.getAudioBuffer(src, is_music);
			b.panWhenReady.push({ obj: inst, ia: innerangle, oa: outerangle, og: dbToLinear(outergain), thistag: tag });
			return;
		}
		
		lastAudio.setPannerEnabled(true);
		var px = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, true);
		var py = cr.rotatePtAround(inst.x, inst.y, -inst.layer.getAngle(), listenerX, listenerY, false);
		lastAudio.setPan(px, py, cr.to_degrees(inst.angle - inst.layer.getAngle()), innerangle, outerangle, dbToLinear(outergain));
		lastAudio.setObject(inst);
		lastAudio.play(looping!==0, v, 0, this.nextPlayTime);
		
		this.nextPlayTime = 0;
	};
	
	Acts.prototype.SetLooping = function (tag, looping)
	{
		getAudioByTag(tag);
		
		// 0 = enable looping, 1 = disable looping
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setLooping(looping === 0);
	};
	
	Acts.prototype.SetMuted = function (tag, muted)
	{
		getAudioByTag(tag);
		
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setMuted(muted === 0);
	};
	
	Acts.prototype.SetVolume = function (tag, vol)
	{
		getAudioByTag(tag);
		
		var v = dbToLinear(vol);
		
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setVolume(v);
	};
	
	Acts.prototype.Preload = function (file)
	{
		if (silent)
			return;
			
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		
		// Using AppMobi - redirect to loadSound
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			
			return;
		}
		else if (api === API_CORDOVA)
		{
			// can't preload with Cordova's Media API
			return;
		}
		
		// Otherwise just request the object without doing anything to it - will be added to the caches
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	
	Acts.prototype.PreloadByName = function (folder, filename)
	{
		if (silent)
			return;
			
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		
		// Using AppMobi - redirect to loadSound
		if (api === API_APPMOBI)
		{
			if (this.runtime.isDirectCanvas)
				AppMobi["context"]["loadSound"](src);
			else
				AppMobi["player"]["loadSound"](src);
			
			return;
		}
		else if (api === API_CORDOVA)
		{
			// can't preload with Cordova's Media API
			return;
		}
		
		// Otherwise just request the object without doing anything to it - will be added to the caches
		this.getAudioInstance(src, "<preload>", is_music, false);
	};
	
	Acts.prototype.SetPlaybackRate = function (tag, rate)
	{
		getAudioByTag(tag);
		
		// Only support forwards playback
		if (rate < 0.0)
			rate = 0;
			
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].setPlaybackRate(rate);
	};
	
	Acts.prototype.Stop = function (tag)
	{
		getAudioByTag(tag);
		
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
			taggedAudio[i].stop();
	};
	
	Acts.prototype.StopAll = function ()
	{
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].stop();
	};
	
	Acts.prototype.SetPaused = function (tag, state)
	{
		getAudioByTag(tag);
		
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			if (state === 0)
				taggedAudio[i].pause();
			else
				taggedAudio[i].resume();
		}
	};
	
	Acts.prototype.Seek = function (tag, pos)
	{
		getAudioByTag(tag);
		
		var i, len;
		for (i = 0, len = taggedAudio.length; i < len; i++)
		{
			taggedAudio[i].seek(pos);
		}
	};
	
	Acts.prototype.SetSilent = function (s)
	{
		var i, len;
		
		if (s === 2)					// toggling
			s = (silent ? 1 : 0);		// choose opposite state
		
		if (s === 0 && !silent)			// setting silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(true);
			
			silent = true;
		}
		else if (s === 1 && silent)		// setting not silent
		{
			for (i = 0, len = audioInstances.length; i < len; i++)
				audioInstances[i].setSilent(false);
			
			silent = false;
		}
	};
	
	Acts.prototype.SetMasterVolume = function (vol)
	{
		masterVolume = dbToLinear(vol);
		
		var i, len;
		for (i = 0, len = audioInstances.length; i < len; i++)
			audioInstances[i].updateVolume();
	};

	Acts.prototype.AddFilterEffect = function (tag, type, freq, detune, q, gain, mix)
	{
		if (api !== API_WEBAUDIO || type < 0 || type >= filterTypes.length || !context["createBiquadFilter"])
			return;
		
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new FilterEffect(type, freq, detune, q, gain, mix));
	};
	
	Acts.prototype.AddDelayEffect = function (tag, delay, gain, mix)
	{
		if (api !== API_WEBAUDIO)
			return;
			
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new DelayEffect(delay, dbToLinear(gain), mix));
	};
	
	Acts.prototype.AddFlangerEffect = function (tag, delay, modulation, freq, feedback, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
			
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new FlangerEffect(delay / 1000, modulation / 1000, freq, feedback / 100, mix));
	};
	
	Acts.prototype.AddPhaserEffect = function (tag, freq, detune, q, mod, modfreq, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
			
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new PhaserEffect(freq, detune, q, mod, modfreq, mix));
	};
	
	Acts.prototype.AddConvolutionEffect = function (tag, file, norm, mix)
	{
		if (api !== API_WEBAUDIO || !context["createConvolver"])
			return;
		
		var doNormalize = (norm === 0);
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");		
		var b = this.getAudioBuffer(src, false);
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		
		var fx;
		
		// buffer loaded
		if (b.bufferObject)
		{
			fx = new ConvolveEffect(b.bufferObject, doNormalize, mix, src);
		}
		// else assign once loaded
		else
		{
			fx = new ConvolveEffect(null, doNormalize, mix, src);
			b.normalizeWhenReady = doNormalize;
			b.convolveWhenReady = fx;
		}
		
		addEffectForTag(tag, fx);
	};
	
	Acts.prototype.AddGainEffect = function (tag, g)
	{
		if (api !== API_WEBAUDIO)
			return;
			
		tag = tag.toLowerCase();
		addEffectForTag(tag, new GainEffect(dbToLinear(g)));
	};
	
	Acts.prototype.AddMuteEffect = function (tag)
	{
		if (api !== API_WEBAUDIO)
			return;
			
		tag = tag.toLowerCase();
		addEffectForTag(tag, new GainEffect(0));	// re-use gain effect with 0 gain
	};
	
	Acts.prototype.AddTremoloEffect = function (tag, freq, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
			
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new TremoloEffect(freq, mix));
	};
	
	Acts.prototype.AddRingModEffect = function (tag, freq, mix)
	{
		if (api !== API_WEBAUDIO || !context["createOscillator"])
			return;
			
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new RingModulatorEffect(freq, mix));
	};
	
	Acts.prototype.AddDistortionEffect = function (tag, threshold, headroom, drive, makeupgain, mix)
	{
		if (api !== API_WEBAUDIO || !context["createWaveShaper"])
			return;
			
		tag = tag.toLowerCase();
		mix = mix / 100;
		if (mix < 0) mix = 0;
		if (mix > 1) mix = 1;
		addEffectForTag(tag, new DistortionEffect(threshold, headroom, drive, makeupgain, mix));
	};
	
	Acts.prototype.AddCompressorEffect = function (tag, threshold, knee, ratio, attack, release)
	{
		if (api !== API_WEBAUDIO || !context["createDynamicsCompressor"])
			return;
			
		tag = tag.toLowerCase();
		addEffectForTag(tag, new CompressorEffect(threshold, knee, ratio, attack / 1000, release / 1000));
	};
	
	Acts.prototype.AddAnalyserEffect = function (tag, fftSize, smoothing)
	{
		if (api !== API_WEBAUDIO)
			return;
			
		tag = tag.toLowerCase();
		addEffectForTag(tag, new AnalyserEffect(fftSize, smoothing));
	};
	
	Acts.prototype.RemoveEffects = function (tag)
	{
		if (api !== API_WEBAUDIO)
			return;
			
		tag = tag.toLowerCase();
		var i, len, arr;
		
		if (effects.hasOwnProperty(tag))
		{
			arr = effects[tag];
			
			if (arr.length)
			{
				for (i = 0, len = arr.length; i < len; i++)
					arr[i].remove();
				
				cr.clearArray(arr);
				reconnectEffects(tag);
			}
		}
	};
	
	Acts.prototype.SetEffectParameter = function (tag, index, param, value, ramp, time)
	{
		if (api !== API_WEBAUDIO)
			return;
			
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var arr;
		
		if (!effects.hasOwnProperty(tag))
			return;
		
		arr = effects[tag];
		
		if (index < 0 || index >= arr.length)
			return;
			
		arr[index].setParam(param, value, ramp, time);
	};
	
	Acts.prototype.SetListenerObject = function (obj_)
	{
		if (!obj_ || api !== API_WEBAUDIO)
			return;
			
		var inst = obj_.getFirstPicked();
		
		if (!inst)
			return;
			
		this.listenerTracker.setObject(inst);
		listenerX = inst.x;
		listenerY = inst.y;
	};
	
	Acts.prototype.SetListenerZ = function (z)
	{
		this.listenerZ = z;
	};
	
	Acts.prototype.ScheduleNextPlay = function (t)
	{
		if (!context)
			return;		// needs Web Audio API
		
		this.nextPlayTime = t;
	};
	
	Acts.prototype.UnloadAudio = function (file)
	{
		var is_music = file[1];
		var src = this.runtime.files_subfolder + file[0] + (useOgg ? ".ogg" : ".m4a");
		
		var b = this.getAudioBuffer(src, is_music, true /* don't create if missing */);
		
		if (!b)
			return;		// not loaded
		
		b.release();
		cr.arrayFindRemove(audioBuffers, b);
	};
	
	Acts.prototype.UnloadAudioByName = function (folder, filename)
	{
		var is_music = (folder === 1);
		var src = this.runtime.files_subfolder + filename.toLowerCase() + (useOgg ? ".ogg" : ".m4a");
		
		var b = this.getAudioBuffer(src, is_music, true /* don't create if missing */);
		
		if (!b)
			return;		// not loaded
		
		b.release();
		cr.arrayFindRemove(audioBuffers, b);
	};
	
	Acts.prototype.UnloadAll = function ()
	{
		var i, len;
		
		for (i = 0, len = audioBuffers.length; i < len; ++i)
		{
			audioBuffers[i].release();
		};
		
		cr.clearArray(audioBuffers);
	};
	
	pluginProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};
	
	Exps.prototype.Duration = function (ret, tag)
	{
		getAudioByTag(tag, true);
		
		if (taggedAudio.length)
			ret.set_float(taggedAudio[0].getDuration());
		else
			ret.set_float(0);
	};
	
	Exps.prototype.PlaybackTime = function (ret, tag)
	{
		getAudioByTag(tag, true);
		
		if (taggedAudio.length)
			ret.set_float(taggedAudio[0].getPlaybackTime(true));
		else
			ret.set_float(0);
	};
	
	Exps.prototype.Volume = function (ret, tag)
	{
		getAudioByTag(tag, true);
		
		if (taggedAudio.length)
		{
			var v = taggedAudio[0].getVolume();
			ret.set_float(linearToDb(v));
		}
		else
			ret.set_float(0);
	};
	
	Exps.prototype.MasterVolume = function (ret)
	{
		ret.set_float(linearToDb(masterVolume));
	};
	
	Exps.prototype.EffectCount = function (ret, tag)
	{
		tag = tag.toLowerCase();
		var arr = null;
		
		if (effects.hasOwnProperty(tag))
			arr = effects[tag];
			
		ret.set_int(arr ? arr.length : 0);
	};
	
	function getAnalyser(tag, index)
	{
		var arr = null;
		
		if (effects.hasOwnProperty(tag))
			arr = effects[tag];
			
		if (arr && index >= 0 && index < arr.length && arr[index].freqBins)
			return arr[index];
		else
			return null;
	};
	
	Exps.prototype.AnalyserFreqBinCount = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
			
		ret.set_int(analyser ? analyser.node["frequencyBinCount"] : 0);
	};
	
	Exps.prototype.AnalyserFreqBinAt = function (ret, tag, index, bin)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		bin = Math.floor(bin);
		var analyser = getAnalyser(tag, index);
			
		if (!analyser)
			ret.set_float(0);
		else if (bin < 0 || bin >= analyser.node["frequencyBinCount"])
			ret.set_float(0);
		else
			ret.set_float(analyser.freqBins[bin]);
	};
	
	Exps.prototype.AnalyserPeakLevel = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
			
		if (analyser)
			ret.set_float(analyser.peak);
		else
			ret.set_float(0);
	};
	
	Exps.prototype.AnalyserRMSLevel = function (ret, tag, index)
	{
		tag = tag.toLowerCase();
		index = Math.floor(index);
		var analyser = getAnalyser(tag, index);
			
		if (analyser)
			ret.set_float(analyser.rms);
		else
			ret.set_float(0);
	};
	
	Exps.prototype.SampleRate = function (ret)
	{
		ret.set_int(context ? context.sampleRate : 0);
	};
	
	Exps.prototype.CurrentTime = function (ret)
	{
		// fall back to now time if web audio API not available
		ret.set_float(context ? context.currentTime : cr.performance_now());
	};
	
	pluginProto.exps = new Exps();

}());