function GetPluginSettings()
{
	return {
		"name":			"BetterAudio",
		"id":			"BetterAudio",
		"version":		"1.0",
		"description":	"Play sound effects and music from files.",
		"author":		"Scirra (edited by XYZT)",
		"help url":		"http://www.scirra.com/manual/109/audio",
		"category":		"Media",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddStringParam("Tag", "The audio tag of the file to detect finishing.");
AddCondition(0, cf_trigger, "On ended", "General", "On {0} ended", "Triggered when an audio file finishes playing.", "OnEnded");

AddCondition(1, 0, "Preloads complete", "General", "All preloads complete", "True when all preloaded audio is ready to play.", "PreloadsComplete");

AddCondition(2, 0, "Advanced audio supported", "Advanced", "Advanced audio supported", "True if advanced audio features are supported (Web Audio API).", "AdvancedAudioSupported");

AddCondition(3, 0, "Is silent", "General", "Is silent", "True if silent mode has been enabled.", "IsSilent");
AddCondition(4, 0, "Is any playing", "General", "Is any playing", "True if any audio is actively playing.", "IsAnyPlaying");

AddStringParam("Tag", "The audio tag of the file to test if playing.");
AddCondition(5, 0, "Is tag playing", "General", "Tag <b>{0}</b> is playing", "True if any audio with a given tag is currently playing.", "IsTagPlaying");


//////////////////////////////////////////////////////////////
// Actions
AddAudioFileParam("Audio file", "Choose the audio file to play.");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0, 2);
AddNumberParam("Volume", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "0", 3);
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", "\"\"", 1);
AddAction(0, 0, "Play", "General", "Play <b>{0}</b> {1} at volume {2} dB (tag <i>{3}</i>)", "Play an audio file.", "Play");

AddStringParam("Path", "Path to a file to play");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0, 2);
AddNumberParam("Volume", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "0", 3);
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", "\"\"", 1);
AddAction(99, 0, "Play at path", "General", "Play <b>{0}</b> {1} at volume {2} dB (tag <i>{3}</i>)", "Play an audio file.", "PlayAtPath");

AddStringParam("Tag", "The tag identifying the sound to loop.  Leave empty to affect the last played sound.");
AddComboParamOption("looping");
AddComboParamOption("not looping");
AddComboParam("State", "Choose whether to turn looping on or off.");
AddAction(1, 0, "Set looping", "General", "Set <i>{0}</i> {1}", "Enable or disable looping on a sound.", "SetLooping");

AddStringParam("Tag", "The tag identifying the sound to loop.  Leave empty to affect the last played sound.");
AddComboParamOption("muted");
AddComboParamOption("unmuted");
AddComboParam("State", "Choose whether to mute or unmute the sound.");
AddAction(2, 0, "Set muted", "General", "Set <i>{0}</i> {1}", "Mute (make silent) or unmute a sound.", "SetMuted");

AddStringParam("Tag", "The tag identifying the sound to loop.  Leave empty to affect the last played sound.");
AddNumberParam("dB", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "-10");
AddAction(3, 0, "Set volume", "General", "Set <i>{0}</i> volume to <b>{1}</b> dB", "Set the volume (loudness) of a sound.", "SetVolume");

AddAudioFileParam("Audio file", "Choose the audio file to preload.  It will be downloaded from the server but not played.");
AddAction(4, 0, "Preload", "General", "Preload <b>{0}</b>", "Download an audio file from the server without playing it.  This ensures it will play immediately.", "Preload");

AddStringParam("Tag", "The tag identifying the sound to loop.  Leave empty to affect the last played sound.");
AddNumberParam("Playback rate", "The rate of playback.  1.0 is normal speed, 0.5 half speed, 2.0 double speed, etc.", "1.0");
AddAction(5, 0, "Set playback rate", "General", "Set <i>{0}</i> playback rate to <b>{1}</b>", "Set the speed at which a sound plays at.", "SetPlaybackRate");

AddStringParam("Tag", "The tag identifying the sound to stop.  Leave empty to affect the last played sound.");
AddAction(6, 0, "Stop", "General", "Stop <b>{0}</b>", "Stop a sound from playing.", "Stop");

AddComboParamOption("Sounds");
AddComboParamOption("Music");
AddComboParam("Folder", "Choose the folder which contains the audio file.");
AddStringParam("Audio file name", "A string with the name of the audio file to play, without the file extension.  For example, to play myfile.ogg, use only \"myfile\".");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0, 3);
AddNumberParam("Volume", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "0", 4);
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", "\"\"", 2);
AddAction(7, 0, "Play (by name)", "General", "Play <b>{1}</b> {2} from {0} at {3} dB (tag <i>{4}</i>)", "Play an audio file using a string for the filename.", "PlayByName");

AddComboParamOption("silent");
AddComboParamOption("not silent");
AddComboParamOption("toggle silent");
AddComboParam("Mode", "Set whether in silent mode or not.");
AddAction(8, 0, "Set silent", "General", "Set {0}", "Set silent mode.  In silent mode all current sounds are muted and no new sounds will play.", "SetSilent");

AddComboParamOption("Sounds");
AddComboParamOption("Music");
AddComboParam("Folder", "Choose the folder which contains the audio file to preload.");
AddStringParam("Audio file name", "A string with the name of the audio file to preload, without the file extension.  For example, to load myfile.ogg, use only \"myfile\".");
AddAction(9, 0, "Preload (by name)", "General", "Preload <b>{1}</b> (from <i>{0}</i>)", "Download an audio file by a string of its name from the server without playing it.", "PreloadByName");

AddNumberParam("dB", "The master attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "-10");
AddAction(10, 0, "Set master volume", "General", "Set master volume to <b>{0}</b> dB", "Set the overall volume of all audio.", "SetMasterVolume");

AddStringParam("Tag", "The audio tag to process.");
AddComboParamOption("low-pass");
AddComboParamOption("high-pass");
AddComboParamOption("band-pass");
AddComboParamOption("low shelf");
AddComboParamOption("high shelf");
AddComboParamOption("peaking");
AddComboParamOption("notch");
AddComboParamOption("all-pass");
AddComboParam("Type", "Select the kind of filter to use for this effect.");
AddNumberParam("Frequency", "The frequency parameter for the chosen filter, in Hertz.", "350");
AddNumberParam("Detune", "The detune to apply, in cents.");
AddNumberParam("Q", "The filter Q factor.", "1");
AddNumberParam("Gain", "The filter gain, if applicable, in decibels.");
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100");
AddAction(11, 0, "Add filter effect", "Advanced: Effects", "Add {1} filter to tag {0} (frequency <i>{2}</i>, detune <i>{3}</i>, Q <i>{4}</i>, gain <i>{5}</i>, mix <i>{6}</i>)", "Add a bi-quad filter effect to all audio with a given tag.", "AddFilterEffect");

AddStringParam("Tag", "The audio tag to remove effects from.");
AddAction(12, 0, "Remove all effects", "Advanced: Effects", "Remove all effects from tag {0}", "Remove all effects from a given tag.", "RemoveEffects");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Delay", "The delay time in seconds.", "0.4");
AddNumberParam("Gain", "The gain of the delayed audio in decibels.", "-5");
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100");
AddAction(13, 0, "Add delay effect", "Advanced: Effects", "Add <i>{1}</i> second delay effect to tag {0} (gain <i>{2}</i> dB, mix <i>{3}</i>)", "Add a delay effect to all audio with a given tag.", "AddDelayEffect");

AddStringParam("Tag", "The audio tag to process.");
AddAudioFileParam("Audio", "Choose an audio file containing an impulse response to use for the convolution effect.");
AddComboParamOption("normalize");
AddComboParamOption("don't normalize");
AddComboParam("Level", "Choose whether to normalize or leave intact the audio file used above.");
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100");
AddAction(14, 0, "Add convolution effect", "Advanced: Effects", "Add convolution effect with <b>{1}</b> to tag {0} (<i>{2}</i>, mix <i>{3}</i>)", "Add a convolution effect (using another sound as impulse response) to all audio with a given tag.", "AddConvolutionEffect");

AddStringParam("Tag", "The tag the effect was added for.");
AddNumberParam("Index", "The zero-based index of the added effect to modify, e.g. 0 for first effect, 1 for second, etc.");
AddComboParamOption("Mix");
AddComboParamOption("Filter/phaser frequency");
AddComboParamOption("Filter/phaser detune");
AddComboParamOption("Filter/phaser Q");
AddComboParamOption("Filter/delay/gain gain");
AddComboParamOption("Delay time");
AddComboParamOption("Flanger/phaser modulation");
AddComboParamOption("Flanger/phaser/tremolo/ring modulation frequency");
AddComboParamOption("Flanger feedback");
AddComboParam("Parameter", "Select the effect parameter to modify.");
AddNumberParam("Value", "The value to set for the parameter.");
AddComboParamOption("Step");
AddComboParamOption("Linear");
AddComboParamOption("Exponential");
AddComboParam("Ramp", "Whether to immediately set the value or smoothly ramp to the intended value.");
AddNumberParam("Time", "The duration of the ramp in seconds, or the delay before stepping the value.");
AddAction(15, 0, "Set effect parameter", "Advanced: Effects", "Set tag {0} effect <i>{1}</i> parameter <b>{2}</b> to <b>{3}</b> ({4} in <i>{5}</i> seconds)", "Set or ramp the parameter of an effect.", "SetEffectParameter");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Delay", "The delay time, in milliseconds.", "5");
AddNumberParam("Modulation", "The magnitude by which to alter the delay time, in milliseconds. Set to 0 for a chorus style effect.", "3");
AddNumberParam("Frequency", "The frequency over which to cycle the delay time, in hertz.", "0.25");
AddNumberParam("Feedback", "The feedback amount, from 0 (none) to 100 (all).", "50", 5);
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100", 4);
AddAction(16, 0, "Add flanger effect", "Advanced: Effects", "Add flanger effect to tag {0} (delay <i>{1}</i> ms, modulation <i>{2}</i> ms, frequency <i>{3}</i> Hz, feedback <i>{4}</i>, mix <i>{5}</i>)", "Add a flanger or chorus style effect to all audio with a given tag.", "AddFlangerEffect");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Frequency", "The frequency in Hertz where the center of the phase transition occurs.", "4000");
AddNumberParam("Detune", "The detune to apply, in cents.");
AddNumberParam("Q", "The filter Q factor.", "0.5");
AddNumberParam("Modulation", "The magnitude by which to alter the frequency, in Hertz.", "3900");
AddNumberParam("Modulation frequency", "The frequency over which to cycle the modulation, in hertz.", "1");
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100");
AddAction(17, 0, "Add phaser effect", "Advanced: Effects", "Add phaser effect to tag {0} (frequency <i>{1}</i> Hz, detune <i>{2}</i> cents, Q <i>{3}</i>, modulation <i>{4}</i>, modulation frequency <i>{5}</i>, mix <i>{6}</i>)", "Add a phaser effect to all audio with a given tag.", "AddPhaserEffect");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Gain", "The volume adjustment, in decibels.", "-10");
AddAction(18, 0, "Add gain effect", "Advanced: Effects", "Add gain effect to tag {0} (<i>{1}</i> dB)", "Add a gain (volume adjustment) effect to all audio with a given tag.", "AddGainEffect");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Threshold", "The threshold above which compression occurs, in dB.", "-24");
AddNumberParam("Knee", "The range above the threshold where the curve smoothly transitions to the 'ratio' portion, in dB.", "30");
AddNumberParam("Ratio", "The amount of dB change in input for a 1dB change in output.", "12");
AddNumberParam("Attack", "The time in which to reduce gain by 10dB, in milliseconds.", "3");
AddNumberParam("Release", "The time in which to increase gain by 10dB, in milliseconds.", "250");
AddAction(19, 0, "Add compressor effect", "Advanced: Effects", "Add compressor effect to tag {0} (threshold <i>{1}</i> dB, knee <i>{2}</i> dB, ratio <i>{3}</i>, attack <i>{4}</i> ms, release <i>{5}</i> ms)", "Add a dynamics compressor effect to all audio with a given tag.", "AddCompressorEffect");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Frequency", "The frequency of amplitude modulation, in Hertz.", "10");
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100");
AddAction(21, 0, "Add tremolo effect", "Advanced: Effects", "Add tremolo effect to tag {0} (<i>{1}</i> Hz, mix <i>{2}</i>)", "Add a tremolo (amplitude modulation) effect to all audio with a given tag.", "AddTremoloEffect");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("FFT size", "The size of the FFT used for frequency-domain analysis. Must be a power of two.", "512");
AddNumberParam("Smoothing", "The smoothing time constant, from 0 (no averaging with last analysis frame) to 1 (averaging).", "0");
AddAction(20, 0, "Add analyser effect", "Advanced: Effects", "Add analyser effect to tag {0} (FFT size <i>{1}</i>, smoothing <i>{2}</i>)", "Add an audio analyser in to a tag's effect chain.", "AddAnalyserEffect");

AddStringParam("Tag", "The audio tag to pause or resume.");
AddComboParamOption("Pause");
AddComboParamOption("Resume");
AddComboParam("State", "Whether to pause or resume the sound with the given tag.");
AddAction(22, 0, "Set paused", "General", "{1} tag <i>{0}</i>", "Pause or resume audio with a given tag.", "SetPaused");

AddStringParam("Tag", "The audio tag to seek.");
AddNumberParam("Position", "The time in the audio to seek to, in seconds.");
AddAction(23, 0, "Seek to", "General", "Seek tag <i>{0}</i> to <i>{1}</i> seconds", "Seek to a particular location in a sound with a tag.", "Seek");

AddAudioFileParam("Audio file", "Choose the audio file to play.");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0);
AddNumberParam("Volume", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "0");
AddNumberParam("X", "The X position in the layout to play the sound at.");
AddNumberParam("Y", "The Y position in the layout to play the sound at.");
AddNumberParam("Angle", "The angle in degrees to play at, if a directional source.");
AddNumberParam("Inner angle", "The cone inner angle (for full volume sound for directional sources) in degrees. 360 means a non-directional sound.", "360");
AddNumberParam("Outer angle", "The cone outer angle (where volume is reduced for directional sources) in degrees.", "360");
AddNumberParam("Outer gain", "The volume reduction in decibels outside the outer angle, for directional sources.", "0");
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", "\"\"");
AddAction(24, 0, "Play at position", "Advanced: Positioned sound", "Play <b>{0}</b> {1} at volume {2} dB at position (<i>{3}</i>, <i>{4}</i>), angle <i>{5}</i> (inner angle <i>{6}</i>, outer angle <i>{7}</i>, outer gain <i>{8}</i> dB) with tag <i>{9}</i>", "Play audio at a position in the layout.", "PlayAtPosition");

AddAudioFileParam("Audio file", "Choose the audio file to play.");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0);
AddNumberParam("Volume", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "0");
AddObjectParam("Object", "Choose the object to play the sound at.");
AddNumberParam("Inner angle", "The cone inner angle (for full volume sound for directional sources) in degrees. 360 means a non-directional sound.", "360");
AddNumberParam("Outer angle", "The cone outer angle (where volume is reduced for directional sources) in degrees.", "360");
AddNumberParam("Outer gain", "The volume reduction in decibels outside the outer angle, for directional sources.", "0");
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", "\"\"");
AddAction(25, 0, "Play at object", "Advanced: Positioned sound", "Play <b>{0}</b> {1} at volume {2} dB at object {3} (inner angle <i>{4}</i>, outer angle <i>{5}</i>, outer gain <i>{6}</i> dB) with tag <i>{7}</i>", "Play audio at an object and track its movement.", "PlayAtObject");

AddObjectParam("Object", "Choose the object to represent the listener.");
AddAction(26, 0, "Set listener object", "Advanced: Positioned sound", "Set listener object to {0}", "Set the object to which volume and panning are relative.", "SetListenerObject");

AddNumberParam("Z", "The new listener Z (height above the layout), in pixels.");
AddAction(27, 0, "Set listener Z", "Advanced: Positioned sound", "Set listener Z to <i>{0}</i>", "Set the listener height above the layout.", "SetListenerZ");

AddComboParamOption("Sounds");
AddComboParamOption("Music");
AddComboParam("Folder", "Choose the folder which contains the audio file.");
AddStringParam("Audio file name", "A string with the name of the audio file to play, without the file extension.  For example, to play myfile.ogg, use only \"myfile\".");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0);
AddNumberParam("Volume", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "0");
AddObjectParam("Object", "Choose the object to play the sound at.");
AddNumberParam("Inner angle", "The cone inner angle (for full volume sound for directional sources) in degrees. 360 means a non-directional sound.", "360");
AddNumberParam("Outer angle", "The cone outer angle (where volume is reduced for directional sources) in degrees.", "360");
AddNumberParam("Outer gain", "The volume reduction in decibels outside the outer angle, for directional sources.", "0");
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", "\"\"");
AddAction(28, 0, "Play at object (by name)", "Advanced: Positioned sound", "Play <b>{1}</b> {2} from {0} at volume {3} dB at object {4} (inner angle <i>{5}</i>, outer angle <i>{6}</i>, outer gain <i>{7}</i> dB) with tag <i>{8}</i>", "Play an audio file by its name at an object and track its movement.", "PlayAtObjectByName");

AddComboParamOption("Sounds");
AddComboParamOption("Music");
AddComboParam("Folder", "Choose the folder which contains the audio file.");
AddStringParam("Audio file name", "A string with the name of the audio file to play, without the file extension.  For example, to play myfile.ogg, use only \"myfile\".");
AddComboParamOption("not looping");
AddComboParamOption("looping");
AddComboParam("Loop", "Whether or not to initially play the sound in a loop (repeating).", 0);
AddNumberParam("Volume", "The attenuation in decibels (dB).  0 is original volume, -10 dB is about half as loud, etc.", "0");
AddNumberParam("X", "The X position in the layout to play the sound at.");
AddNumberParam("Y", "The Y position in the layout to play the sound at.");
AddNumberParam("Angle", "The angle in degrees to play at, if a directional source.");
AddNumberParam("Inner angle", "The cone inner angle (for full volume sound for directional sources) in degrees. 360 means a non-directional sound.", "360");
AddNumberParam("Outer angle", "The cone outer angle (where volume is reduced for directional sources) in degrees.", "360");
AddNumberParam("Outer gain", "The volume reduction in decibels outside the outer angle, for directional sources.", "0");
AddStringParam("Tag (optional)", "A tag, which can be anything you like, to use to reference this sound in future.", "\"\"");
AddAction(29, 0, "Play at position (by name)", "Advanced: Positioned sound", "Play <b>{1}</b> {2} from {0} at volume {3} dB at position (<i>{4}</i>, <i>{5}</i>), angle <i>{6}</i> (inner angle <i>{7}</i>, outer angle <i>{8}</i>, outer gain <i>{9}</i> dB) with tag <i>{10}</i>", "Play an audio file by its name at a position in the layout.", "PlayAtPositionByName");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Frequency", "The frequency of the ring modulator, in Hertz.", "600");
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100");
AddAction(30, 0, "Add ring mod effect", "Advanced: Effects", "Add ring modulator effect to tag {0} (<i>{1}</i> Hz, mix <i>{2}</i>)", "Add a ring modulator effect to all audio with a given tag.", "AddRingModEffect");

AddStringParam("Tag", "The audio tag to process.");
AddNumberParam("Threshold", "The distortion threshold, in dB.", "-27");
AddNumberParam("Headroom", "The distortion headroom, in dB.", "21");
AddNumberParam("Drive", "The distortion drive.", "5");
AddNumberParam("Make-up gain", "The additional volume increase after the effect, in dB.", "3");
AddNumberParam("Mix", "The wet/dry mix, from 0 (no effect) to 100 (full effect).", "100");
AddAction(31, 0, "Add distortion effect", "Advanced: Effects", "Add distortion effect to tag {0} (threshold <i>{1}</i> dB, headroom <i>{2}</i> dB, drive <i>{3}</i>, make-up gain <i>{4}</i> dB, mix <i>{5}</i>)", "Add a distortion effect to all audio with a given tag.", "AddDistortionEffect");

AddStringParam("Tag", "The audio tag to mute.");
AddAction(32, 0, "Add mute effect", "Advanced: Effects", "Add mute effect to tag {0}", "Add a mute to an effect chain, useful after an analyser.", "AddMuteEffect");

AddAction(33, 0, "Stop all", "General", "Stop all", "Stop all currently playing sounds.", "StopAll");

AddNumberParam("Time", "Time in seconds at which to sample-accurately schedule the next Play. Normally this is of the form Audio.CurrentTime + N.");
AddAction(34, 0, "Schedule next play", "Advanced: Other", "Schedule next play for <i>{0}</i>", "Schedule the next Play action sample-accurately.", "ScheduleNextPlay");

AddAudioFileParam("Audio file", "Choose the audio file to unload.");
AddAction(35, 0, "Unload audio", "Memory", "Unload <b>{0}</b>", "Unload an audio file from memory.", "UnloadAudio");

AddComboParamOption("Sounds");
AddComboParamOption("Music");
AddComboParam("Folder", "Choose the folder which contains the audio file to preload.");
AddStringParam("Audio file name", "A string with the name of the audio file to unload, without the file extension.  For example, to unload myfile.ogg, use only \"myfile\".");
AddAction(36, 0, "Unload audio (by name)", "Memory", "Unload <b>{1}</b> from {0}", "Unload an audio file from memory by a string of its name.", "UnloadAudioByName");

AddAction(37, 0, "Unload all audio", "Memory", "Unload all", "Unload all audio files from memory.", "UnloadAll");

//////////////////////////////////////////////////////////////
// Expressions
AddStringParam("Tag", "Tag of the sound to use");
AddExpression(0, ef_return_number, "", "General", "Duration", "Get the duration in seconds of a sound with a tag.");

AddStringParam("Tag", "Tag of the sound to use");
AddExpression(1, ef_return_number, "", "General", "PlaybackTime", "Get the playback position in seconds of a sound with a tag.");

AddStringParam("Tag", "Tag of the sound to use");
AddExpression(2, ef_return_number, "", "General", "Volume", "Get the current volume, in decibels, of a sound with a tag.");

AddExpression(3, ef_return_number, "", "General", "MasterVolume", "Get the current master volume, in decibels.");

AddStringParam("Tag", "Tag of the sound to use");
AddExpression(4, ef_return_number, "", "Advanced: Effects", "EffectCount", "Get the current number of effects added to a tag.");

AddStringParam("Tag", "Tag of the sound to use");
AddNumberParam("Index", "Index of the analyser effect");
AddExpression(5, ef_return_number, "", "Advanced: Effects", "AnalyserFreqBinCount", "Get the number of frequency bins returned by an analyser effect.");

AddStringParam("Tag", "Tag of the sound to use");
AddNumberParam("Index", "Index of the analyser effect");
AddNumberParam("Bin", "Index of the frequency bin");
AddExpression(6, ef_return_number, "", "Advanced: Effects", "AnalyserFreqBinAt", "Get the magnitude of an analyser's Nth frequency bin.");

AddStringParam("Tag", "Tag of the sound to use");
AddNumberParam("Index", "Index of the analyser effect");
AddExpression(7, ef_return_number, "", "Advanced: Effects", "AnalyserPeakLevel", "Get the peak level from an analyser.");

AddStringParam("Tag", "Tag of the sound to use");
AddNumberParam("Index", "Index of the analyser effect");
AddExpression(8, ef_return_number, "", "Advanced: Effects", "AnalyserRMSLevel", "Get the RMS level from an analyser.");

AddExpression(9, ef_return_number, "", "General", "SampleRate", "Get the audio output sample rate in Hz.");

AddExpression(10, ef_return_number, "", "General", "CurrentTime", "Get the audio clock time in seconds.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo,	"Timescale audio",	"Off",	"Choose whether the audio playback rate changes with the time scale.", "Off|On (sounds only)|On (sounds and music)"),
	new cr.Property(ept_combo,	"Save/load",		"All",	"What playback state to save when using the save/load system.", "All|Sounds only|Music only|None"),
	new cr.Property(ept_combo,	"Play in background",	"No",	"Keep playing audio even when the tab or app goes in to the background.", "No|Yes"),
	new cr.Property(ept_section, "Positioned audio", "",	"Properties affecting the playback of positioned sounds."),
	new cr.Property(ept_combo,	"Panning model",	"HRTF",	"The panning model used to process positioned audio.", "Equal power|HRTF" /* soundfield: not yet implemented */),
	new cr.Property(ept_combo,	"Distance model",	"Inverse",	"The formula to determine volume reduction over distance.", "Linear|Inverse|Exponential"),
	new cr.Property(ept_float,	"Listener Z height",	"600",	"The height of the listener above the layout, in pixels."),
	new cr.Property(ept_float,	"Reference distance",	"600",	"A reference distance for reducing volume as sources move further away, in pixels."),
	new cr.Property(ept_float,	"Maximum distance",	"10000",	"The distance, in pixels, after which volume is not reduced any further."),
	new cr.Property(ept_float,	"Roll-off factor",	"1",	"How quickly the volume is reduced as sources move away.")
	
	// Properties no longer supported
	//new cr.Property(ept_float,	"Speed of sound",	"5000",	"The speed of sound, in pixels per second, for calculating doppler shift."),
	//new cr.Property(ept_float,	"Doppler factor",	"1",	"How much pitch shift to use for doppler effects.")
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
