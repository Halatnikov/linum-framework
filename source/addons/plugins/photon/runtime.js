// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

// assign globals with correct value in case closure compilier renames them
var Photon = this["Photon"];
var Exitgames = this["Exitgames"];

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.Photon = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.Photon.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;
	
	instanceProto.createLBC = function() 
	{
		Photon["LoadBalancing"]["LoadBalancingClient"].prototype["roomFactory"] = function(name) {
			var r = new Photon["LoadBalancing"]["Room"](name);
			r["onPropertiesChange"] = function (changedCustomProps, byClient) {
				self.changedPropertiesNames = [];
				for(var i in changedCustomProps) {
					self.changedPropertiesNames.push(i);
				}
			};
			return r;
		};
		Photon["LoadBalancing"]["LoadBalancingClient"].prototype["actorFactory"] = function(name, actorNr, isLocal) {
			var a = new Photon["LoadBalancing"]["Actor"](name, actorNr, isLocal);
			a["onPropertiesChange"] = function (changedCustomProps, byClient) {

				self.changedPropertiesNames = [];
				for(var i in changedCustomProps) {
					self.changedPropertiesNames.push(i);
				}
			};
			return a;
		};

		Exitgames["Common"]["Logger"]["setExceptionHandler"](function(code, message) {
			self.errorCode = code;
			self.errorMsg = message;
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onError, self);
			return false;
		});
		
		this.lbc = new Photon["LoadBalancing"]["LoadBalancingClient"](this.Protocol, this.AppId, this.AppVersion);
		var self = this;
		
		this.lbc["setLogLevel"](this.LogLevel);
		
		this.lbc["onError"] = function(errorCode, errorMsg) {
			self.errorCode = errorCode;
			self.errorMsg = errorMsg;
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onError, self);
		};
		
		this.lbc["onStateChange"] = function(state) {
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onStateChange, self);
			
			var LBC = Photon["LoadBalancing"]["LoadBalancingClient"];
			switch (state) {
//				case LBC["State"]["ConnectedToNameServer"]:
//					this.getRegions();
//					this.connectToRegionMaster(this.Region);
//					break;
				case LBC["State"]["JoinedLobby"]:
					self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onJoinedLobby, self);
					break;
				case LBC["State"]["Disconnected"]:
					self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onDisconnected, self);
					break;
				default:
					break;
			}
		};
		
		this.lbc["onOperationResponse"] = function (errorCode, errorMsg, code, content) {
			if (errorCode) {
				switch (code) {
					case Photon["LoadBalancing"]["Constants"]["OperationCode"]["JoinRandomGame"]:
						switch (errorCode) {
							case Photon["LoadBalancing"]["Constants"]["ErrorCode"]["NoRandomMatchFound"]:
								self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onJoinRandomRoomNoMatchFound, self);
								break;
							default:
								break;
						}
						break;
					default:
//						console.log("Operation Response error:", errorCode, errorMsg, code, content);
						self.errorCode = errorCode;
						self.errorMsg = errorMsg;
						self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onError, self);
						break;
				}
			}
		};
		
		this.lbc["onEvent"] = function (code, data, actorNr) {
			self.eventCode = code;
			self.eventData = data;
			self.actorNr = actorNr;
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onEvent, self);
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onAnyEvent, self);
        };
		
		this.lbc["onRoomList"] = function (rooms){ 
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onRoomList, self);
		};

        this.lbc["onRoomListUpdate"] = function (rooms, roomsUpdated, roomsAdded, roomsRemoved) { 
			// TODO:
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onRoomListUpdate, self);
		};
		
        this.lbc["onMyRoomPropertiesChange"] = function () { 
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onMyRoomPropertiesChange, self);
		};

        this.lbc["onActorPropertiesChange"] = function (actor) { 
			self.actorNr = actor["actorNr"];
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onActorPropertiesChange, self);
		};
		
		this.lbc["onJoinRoom"] = function (createdByMe) {
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onJoinRoom, self);
		};
		
		this.lbc["onActorJoin"] = function (actor) {
			self.actorNr = actor["actorNr"];
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onActorJoin, self);
		};
		this.lbc["onActorLeave"] = function (actor) {
			self.actorNr = actor["actorNr"];
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onActorLeave, self);
        };
		this.lbc["onActorSuspend"] = function (actor) {
			self.actorNr = actor["actorNr"];
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onActorSuspend, self);
        };
		this.lbc["onWebRpcResult"] = function (errorCode, errorMsg, uriPath, resultCode, data) {
			self.errorCode = errorCode;
			self.errorMsg = errorMsg;
			self.webRpcUriPath = uriPath;
			self.webRpcResultCode = resultCode;
			self.webRpcData = data;
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onWebRpcResult, self);
        };
		this.lbc["onFindFriendsResult"] = function (errorCode, errorMsg, friends) {
			self.errorCode = errorCode;
			self.errorMsg = errorMsg;
			self.friends = friends;
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onFindFriendsResult, self);
        };
		this.lbc["onLobbyStats"] = function (errorCode, errorMsg, lobbies) {
			self.errorCode = errorCode;
			self.errorMsg = errorMsg;
			self.lobbyStats = lobbies;
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onLobbyStats, self);
        };
		this.lbc["onAppStats"] = function (errorCode, errorMsg, stats) {
			self.errorCode = errorCode;
			self.errorMsg = errorMsg;
			self.appStats = stats;
			self.runtime.trigger(cr.plugins_.Photon.prototype.cnds.onAppStats, self);
        };
    };

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;

		this.AppId = this.properties[0];
		this.AppVersion = this.properties[1];
		this.Protocol = ["ws", "wss"][this.properties[2]] == "wss" ? this.Protocol = Photon["ConnectionProtocol"]["Wss"] : Photon["ConnectionProtocol"]["Ws"];
		this.Region = ["eu", "us", "asia", "jp", "au", "usw", "sa", "cae", "kr", "in", "cn", "ru", "rue"][this.properties[3]];
		this.SelfHosted = this.properties[4] == 1;
		this.SelfHostedAddress = this.properties[5];
		this.LogLevel = this.properties[6] + Exitgames["Common"]["Logger"]["Level"]["DEBUG"]; // list starts from DEBUG = 1
		
		this.createLBC();
	}
	
	// called whenever an instance is destroyed
	// note the runtime may keep the object after this call for recycling; be sure
	// to release/recycle/reset any references to other objects in this function.
	instanceProto.onDestroy = function ()
	{
	};
	
	// called when saving the full state of the game
	instanceProto.saveToJSON = function ()
	{
		// return a Javascript object containing information about your object's state
		// note you MUST use double-quote syntax (e.g. "property": value) to prevent
		// Closure Compiler renaming and breaking the save format
		return {
			// e.g.
			//"myValue": this.myValue
		};
	};
	
	// called when loading the full state of the game
	instanceProto.loadFromJSON = function (o)
	{
		// load from the state previously saved by saveToJSON
		// 'o' provides the same object that you saved, e.g.
		// this.myValue = o["myValue"];
		// note you MUST use double-quote syntax (e.g. o["property"]) to prevent
		// Closure Compiler renaming and breaking the save format
	};
	
	// only called if a layout object - draw to a canvas 2D context
	instanceProto.draw = function(ctx)
	{
	};
	
	// only called if a layout object in WebGL mode - draw to the WebGL context
	// 'glw' is not a WebGL context, it's a wrapper - you can find its methods in GLWrap.js in the install
	// directory or just copy what other plugins do.
	instanceProto.drawGL = function (glw)
	{
	};
	
	// The comments around these functions ensure they are removed when exporting, since the
	// debugger code is no longer relevant after publishing.
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		// Append to propsections any debugger sections you want to appear.
		// Each section is an object with two members: "title" and "properties".
		// "properties" is an array of individual debugger properties to display
		// with their name and value, and some other optional settings.
		propsections.push({
			"title": "My debugger section",
			"properties": [
				// Each property entry can use the following values:
				// "name" (required): name of the property (must be unique within this section)
				// "value" (required): a boolean, number or string for the value
				// "html" (optional, default false): set to true to interpret the name and value
				//									 as HTML strings rather than simple plain text
				// "readonly" (optional, default false): set to true to disable editing the property
				
				// Example:
				// {"name": "My property", "value": this.myValue}
			]
		});
	};
	
	instanceProto.onDebugValueEdited = function (header, name, value)
	{
		// Called when a non-readonly property has been edited in the debugger. Usually you only
		// will need 'name' (the property name) and 'value', but you can also use 'header' (the
		// header title for the section) to distinguish properties with the same name.
		if (name === "My property")
			this.myProperty = value;
	};
	/**END-PREVIEWONLY**/

	//////////////////////////////////////
	// Conditions
	function Cnds() {}

	Cnds.prototype.onError 					= function() { return true; };
	Cnds.prototype.onStateChange 			= function() { return true; };
	Cnds.prototype.onEvent 					= function(code) { return this.eventCode == code; };
	Cnds.prototype.onAnyEvent 				= function() { return true; };
	Cnds.prototype.onRoomList 				= function() { return true; };
	Cnds.prototype.onRoomListUpdate 		= function() { return true; };
	Cnds.prototype.onActorPropertiesChange 	= function() { return true; };
	Cnds.prototype.onMyRoomPropertiesChange = function() { return true; };
	Cnds.prototype.onJoinRoom 				= function() { return true; };
	Cnds.prototype.onActorJoin 				= function() { return true; };
	Cnds.prototype.onActorLeave 			= function() { return true; };
	Cnds.prototype.onActorSuspend 			= function() { return true; };

	Cnds.prototype.onWebRpcResult 			= function() { return true; };
	Cnds.prototype.onFindFriendsResult 		= function() { return true; };
	Cnds.prototype.onLobbyStats 			= function() { return true; };
	Cnds.prototype.onAppStats 				= function() { return true; };
		
	Cnds.prototype.onJoinedLobby 	 = function() { return true; };
	Cnds.prototype.onJoinRandomRoomNoMatchFound  = function() { return true; };
	Cnds.prototype.onDisconnected  = function() { return true; };
	
	Cnds.prototype.isConnectedToNameServer = function ()
	{
		return this.lbc["isConnectedToNameServer"]();
	};
	Cnds.prototype.isConnectedToMaster = function ()
	{
		return this.lbc["isConnectedToMaster"]();
	};
	Cnds.prototype.isInLobby = function ()
	{
		return this.lbc["isInLobby"]();
	};
	Cnds.prototype.isJoinedToRoom = function ()
	{
		return this.lbc["isJoinedToRoom"]();
	};
	
	
	// ... other conditions here ...
	
	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {}

	Acts.prototype.setUserId = function (userId)
	{
		this.lbc["setUserId"](userId);
	};
	
	Acts.prototype.setCustomAuthentication = function (authParameters, authType)
	{
		this.lbc["setCustomAuthentication"](authParameters, authType);
	};

	Acts.prototype.setHostingType = function (hostType)
	{
		this.SelfHosted = hostType == 1;
	};

	Acts.prototype.setSelfHostedAddress = function (address)
	{		
		this.SelfHostedAddress = address;
	};
	
	Acts.prototype.setRegion = function (region)
	{
		this.Region = region;
	};

	Acts.prototype.setAppId = function (appId)
	{
		this.AppId = appId;
	};

	Acts.prototype.setAppVersion = function (version)
	{
		this.AppVersion = version;
	};
	
	Acts.prototype.connect = function ()
	{
		if (this.SelfHosted) {
			this.lbc["setMasterServerAddress"](this.SelfHostedAddress);
			this.lbc["connect"]();
		}
		else {
			if (this.Region)
				this.lbc["connectToRegionMaster"](this.Region);
			else
				this.lbc["connectToNameServer"]();
		}
	};

	Acts.prototype.createRoom = function (name, lobbyName, lobbyType)
	{
		if (lobbyType == 1)  {
			lobbyType = Photon["LoadBalancing"]["Constants"]["LobbyType"]["SqlLobby"]; // 2
		}
		var options = {			
			"lobbyName": lobbyName,
			"lobbyType": lobbyType
		};
		this.lbc["createRoomFromMy"](name, options);
	};

	Acts.prototype.joinRoom = function (name, rejoin, createIfNotExists, lobbyName, lobbyType)
	{
		if (lobbyType == 1)  {
			lobbyType = Photon["LoadBalancing"]["Constants"]["LobbyType"]["SqlLobby"]; // 2
		}
		var joinOptions = {
			"rejoin": rejoin && true,
			"createIfNotExists": createIfNotExists && true,
			"lobbyName": lobbyName,
			"lobbyType": lobbyType
		};
		var createOptions = {			
			"lobbyName": lobbyName,
			"lobbyType": lobbyType
		};
		createOptions = this.lbc["copyCreateOptionsFromMyRoom"](createOptions);
		this.lbc["joinRoom"](name, joinOptions, createOptions);
	};

	Acts.prototype.joinRandomRoom = function (matchMyRoom, matchmakingMode, lobbyName, lobbyType, sqlLobbyFilter)
	{
		if (lobbyType == 1)  {
			lobbyType = Photon["LoadBalancing"]["Constants"]["LobbyType"]["SqlLobby"]; // 2
		}
		var options = {						
			"matchmakingMode": matchmakingMode,
			"lobbyName": lobbyName,
			"lobbyType": lobbyType,
			"sqlLobbyFilter": sqlLobbyFilter
		};
		if (matchMyRoom) {
			options.expectedCustomRoomProperties = this.lbc["myRoom"]()["_customProperties"];
			options.expectedMaxPlayers = this.lbc["myRoom"]()["maxPlayers"];
		}
		this.lbc["joinRandomRoom"](options);
	};
	
	Acts.prototype.disconnect = function ()
	{
		this.lbc["disconnect"]();
	};
	
	Acts.prototype.suspendRoom = function ()
	{
		this.lbc["suspendRoom"]();
	};
	
	Acts.prototype.leaveRoom = function ()
	{
		this.lbc["leaveRoom"]();
	};
	
	Acts.prototype.raiseEvent = function (eventCode, data, interestGroup, cache, receivers, targetActors, webForward)
	{
		var opt = {
			"interestGroup": interestGroup,
			"cache": cache,
			"receivers": receivers,
			// "targetActors": targetActors,
			"webForward": webForward
		};
		if(typeof(targetActors) === "string" && targetActors) {
			opt["targetActors"] = targetActors.split(",").map(function(x) { return parseInt(x); } );
		}
		this.lbc["raiseEvent"](eventCode, data, opt);
	};

	Acts.prototype.changeGroups = function (action, group)
	{
		switch (action) {
			case 0: // Add
				this.lbc["changeGroups"](null, [group]);
				break;
			case 1: // Add all current
				this.lbc["changeGroups"](null ,[]);
				break;
			case 2: // Remove				
				this.lbc["changeGroups"]([group], null);
				break;
			case 3: // Remove all
				this.lbc["changeGroups"]([], null);
				break;
		}
	};

	Acts.prototype.webRpc = function (uriPath, parameters, parametersType)
	{
		this.lbc["webRpc"](uriPath, parametersType ? JSON.parse(parameters) : parameters);
	};
	
	Acts.prototype.findFriends = function (friends)
	{
		this.lbc["findFriends"](friends.split(","));
	};
	
	Acts.prototype.requestLobbyStats = function ()
	{
		this.lbc["requestLobbyStats"]();
	};

	Acts.prototype.setMyActorName = function (name)
	{
		this.lbc["myActor"]()["setName"](name);
	};
	Acts.prototype.setPropertyOfActorByNr = function (nr, propName, propValue, webForward, checkAndSet, expectedValue)
	{
		this.lbc["myRoomActors"]()[nr]["setCustomProperty"](propName, propValue, webForward, checkAndSet ? expectedValue : undefined);
	};
	Acts.prototype.setPropertyOfMyRoom = function (propName, propValue, webForward, checkAndSet, expectedValue)
	{
		this.lbc["myRoom"]()["setCustomProperty"](propName, propValue, webForward, checkAndSet ? expectedValue : undefined);
	};
	Acts.prototype.setPropsListedInLobby = function (propNames)
	{
		this.lbc["myRoom"]()["setPropsListedInLobby"](propNames.split(","));
	};
	Acts.prototype.setMyRoomIsVisible = function (isVisisble)
	{
		this.lbc["myRoom"]()["setIsVisible"](isVisisble ? true : false);
	};
	Acts.prototype.setMyRoomIsOpen = function (isOpen)
	{
		this.lbc["myRoom"]()["setIsOpen"](isOpen ? true : false);
	};
	Acts.prototype.setMyRoomMaxPlayers = function (maxPlayers)
	{
		this.lbc["myRoom"]()["setMaxPlayers"](maxPlayers);
	};
	Acts.prototype.setEmptyRoomLiveTime = function (emptyRoomLiveTime)
	{
		this.lbc["myRoom"]()["setEmptyRoomLiveTime"](emptyRoomLiveTime);
	};
	Acts.prototype.setSuspendedPlayerLiveTime = function (suspendedPlayerLiveTime)
	{
		this.lbc["myRoom"]()["setSuspendedPlayerLiveTime"](suspendedPlayerLiveTime);
	};
	Acts.prototype.setUniqueUserId = function (unique)
	{
		this.lbc.logger.error("'Set unique userid check' action is deprecated. Please remove it from project. Rooms always created with 'unique userid check' set to true.");
	};
	Acts.prototype.reset = function ()
	{
		this.lbc["disconnect"]();
		this.createLBC();
		this.lbc["logger"]["info"]("Photon client reset.");
	};
	
	// ... other actions here ...
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {}

	Exps.prototype.ErrorCode = function (ret)
	{
		ret.set_int(this.errorCode || 0);
	};
	
	Exps.prototype.ErrorMessage = function (ret)
	{
		ret.set_string(this.errorMsg || "");
	};
	
	Exps.prototype.State = function (ret)
	{
		ret.set_int(this.lbc["state"]);
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	};
	
	Exps.prototype.StateString = function (ret)
	{
		ret.set_string(Photon["LoadBalancing"]["LoadBalancingClient"]["StateToName"](this.lbc["state"]));
	};

	Exps.prototype.UserId = function (ret)
	{
		ret.set_string(this.lbc["getUserId"]() || "");
	};

	Exps.prototype.MyActorNr = function (ret)
	{
		ret.set_int(this.lbc["myActor"]()["actorNr"]);
	};

	Exps.prototype.ActorNr = function (ret)
	{
		ret.set_int(this.actorNr || 0);
	};
	
	Exps.prototype.MyRoomName = function (ret)
	{
		ret.set_string(this.lbc["myRoom"]()["name"] || "");
	};
	
	Exps.prototype.EventCode = function (ret)
	{
		ret.set_int(this.eventCode || 0);
	};
	
	Exps.prototype.EventData = function (ret)
	{
		ret.set_any(this.eventData);
	};
	
	Exps.prototype.RoomCount = function (ret)
	{
		ret.set_int(this.lbc["availableRooms"]().length);
	};

	Exps.prototype.RoomNameAt = function (ret, i)
	{
		ret.set_string(this.lbc["availableRooms"]()[i]["name"] || "");
	};

	Exps.prototype.RoomMaxPlayers = function (ret, name)
	{
		var r = this.lbc["roomInfosDict"][name];
		ret.set_int(r && r["maxPlayers"] || 0);
	};

	Exps.prototype.RoomIsOpen = function (ret, name)
	{
		var r = this.lbc["roomInfosDict"][name];
		ret.set_int(r && r["isOpen"] ? 1 : 0);
	};
	
	Exps.prototype.RoomPlayerCount = function (ret, name)
	{
		var r = this.lbc["roomInfosDict"][name];
		ret.set_int(r && r["playerCount"]);
	};

	Exps.prototype.RoomProperty = function (ret, name, propName)
	{
		var r = this.lbc["roomInfosDict"][name];
		ret.set_any(r && r["getCustomProperty"](propName));
	};
	
	Exps.prototype.PropertyOfMyRoom = function (ret, propName)
	{
		var r = this.lbc["myRoom"]();
		ret.set_any(r && r["getCustomProperty"](propName));
	};
	
	Exps.prototype.ActorCount = function (ret)
	{
		ret.set_int(this.lbc["myRoomActorsArray"]().length);
	};

	Exps.prototype.ActorNrAt = function (ret, i)
	{
		var a = this.lbc["myRoomActorsArray"]()[i];
		ret.set_int(a && a["actorNr"] || -i);
	};

	Exps.prototype.ActorNameByNr = function (ret, nr)
	{
		var a = this.lbc["myRoomActors"]()[nr];
		ret.set_string(a && a["name"] || "-- not found acorNr " + nr);
	};

	Exps.prototype.PropertyOfActorByNr = function (ret, nr, propName)
	{
		var a = this.lbc["myRoomActors"]()[nr];
		ret.set_any(a && a["getCustomProperty"](propName));
	};

	Exps.prototype.ChangedPropertiesCount = function (ret)
	{
		ret.set_int(this.changedPropertiesNames && this.changedPropertiesNames.length || 0);
	};

	Exps.prototype.ChangedPropertyNameAt = function (ret, i)
	{
		ret.set_any(this.changedPropertiesNames && this.changedPropertiesNames[i]);
	};

	Exps.prototype.MasterActorNr = function (ret, i)
	{
		ret.set_int(this.lbc["myRoomMasterActorNr"]());
	};
	
	Exps.prototype.WebRpcUriPath = function (ret)
	{
		ret.set_string(this.webRpcUriPath || "");
	};
	
	Exps.prototype.WebRpcResultCode = function (ret)
	{
		ret.set_int(this.webRpcResultCode || 0);
	};

	Exps.prototype.WebRpcData = function (ret)
	{
		ret.set_any(this.webRpcData);
	};
	
	Exps.prototype.FriendOnline = function (ret, name)
	{
		ret.set_int(this.friends && this.friends[name] && this.friends[name]["online"] ? 1 : 0);
	};
	
	Exps.prototype.FriendRoom = function (ret, name)
	{
		ret.set_string(this.friends && this.friends[name] ? this.friends[name]["roomId"] : "");
	};

	Exps.prototype.LobbyStatsCount = function (ret)
	{
		ret.set_int(this.lobbyStats ? this.lobbyStats.length : 0);
	};
	
	Exps.prototype.LobbyStatsNameAt = function (ret, i)
	{
		ret.set_string(this.lobbyStats && this.lobbyStats[i] ? this.lobbyStats[i]["lobbyName"] : "");
	};
	
	Exps.prototype.LobbyStatsTypeAt = function (ret, i)
	{
		ret.set_int(this.lobbyStats && this.lobbyStats[i] ? this.lobbyStats[i]["lobbyType"] : 0);
	};

	Exps.prototype.LobbyStatsPeerCountAt = function (ret, i)
	{
		ret.set_int(this.lobbyStats && this.lobbyStats[i] ? this.lobbyStats[i]["peerCount"] : 0);
	};
	
	Exps.prototype.LobbyStatsGameCountAt = function (ret, i)
	{
		ret.set_int(this.lobbyStats && this.lobbyStats[i] ? this.lobbyStats[i]["gameCount"] : 0);
	};

	Exps.prototype.AppStatsPeerCount = function (ret, i)
	{
		ret.set_int(this.appStats ? this.appStats["peerCount"] : 0);
	};

	Exps.prototype.AppStatsMasterPeerCount = function (ret, i)
	{
		ret.set_int(this.appStats ? this.appStats["masterPeerCount"] : 0);
	};

	Exps.prototype.AppStatsGameCount = function (ret, i)
	{
		ret.set_int(this.appStats ? this.appStats["gameCount"] : 0);
	};
	
	// ... other expressions here ...
	
	pluginProto.exps = new Exps();

}());