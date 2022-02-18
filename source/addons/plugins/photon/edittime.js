// TODO:
// - check names (properties and other)

function GetPluginSettings()
{
	return {
		"name":			"Photon",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"Photon",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Add multiplayer to your games and launch them globally with the included FREE Photon Cloud plan",
		"author":		"Exit Games",
		"help url":		"doc.photonengine.com",
		"category":		"Web",					// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"dependency":	"Photon-Javascript_SDK.min.js",
		"flags":		0						// uncomment lines to enable flags...
						| pf_singleglobal		// exists project-wide, e.g. mouse, keyboard.  "type" must be "object".
					//	| pf_texture			// object has a single texture (e.g. tiled background)
					//	| pf_position_aces		// compare/set/get x, y...
					//	| pf_size_aces			// compare/set/get width, height...
					//	| pf_angle_aces			// compare/set/get angle (recommended that "rotatable" be set to true)
					//	| pf_appearance_aces	// compare/set/get visible, opacity...
					//	| pf_tiling				// adjusts image editor features to better suit tiled images (e.g. tiled background)
					//	| pf_animations			// enables the animations system.  See 'Sprite' for usage
					//	| pf_zorder_aces		// move to top, bottom, layer...
					//  | pf_nosize				// prevent resizing in the editor
					//	| pf_effects			// allow WebGL shader effects to be added
					//  | pf_predraw			// set for any plugin which draws and is not a sprite (i.e. does not simply draw
												// a single non-tiling image the size of the object) - required for effects to work properly
	};
}

////////////////////////////////////////
// Parameter types:
// AddNumberParam(label, description [, initial_string = "0"])			// a number
// AddStringParam(label, description [, initial_string = "\"\""])		// a string
// AddAnyTypeParam(label, description [, initial_string = "0"])			// accepts either a number or string
// AddCmpParam(label, description)										// combo with equal, not equal, less, etc.
// AddComboParamOption(text)											// (repeat before "AddComboParam" to add combo items)
// AddComboParam(label, description [, initial_selection = 0])			// a dropdown list parameter
// AddObjectParam(label, description)									// a button to click and pick an object type
// AddLayerParam(label, description)									// accepts either a layer number or name (string)
// AddLayoutParam(label, description)									// a dropdown list with all project layouts
// AddKeybParam(label, description)										// a button to click and press a key (returns a VK)
// AddAnimationParam(label, description)								// a string intended to specify an animation name
// AddAudioFileParam(label, description)								// a dropdown list with all imported project audio files

////////////////////////////////////////
// Conditions

// AddCondition(id,					// any positive integer to uniquely identify this condition
//				flags,				// (see docs) cf_none, cf_trigger, cf_fake_trigger, cf_static, cf_not_invertible,
//									// cf_deprecated, cf_incompatible_with_triggers, cf_looping
//				list_name,			// appears in event wizard list
//				category,			// category in event wizard list
//				display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//				description,		// appears in event wizard dialog when selected
//				script_name);		// corresponding runtime function name
				
// example				



AddCondition(0, cf_trigger, "On error", "Client", "On error", "Triggered on error.", "onError");
AddCondition(1, cf_trigger, "On state change", "Client", "On state change", "Triggered on client state change.", "onStateChange");
//onOperationResponse
AddNumberParam("Code", "Event code.");
AddCondition(3, cf_trigger, "On event", "Room", "On event <b>{0}</b>", "Triggered on custom event with specific code.", "onEvent");
AddCondition(4, cf_trigger, "On any event", "Room", "On any event", "Triggered on any custom event.", "onAnyEvent");
AddCondition(10, cf_trigger, "On room list", "Lobby", "On room list", "Triggered on room list receive.", "onRoomList");
AddCondition(11, cf_trigger, "On room list update", "Lobby", "On room list update", "Triggered on room list update.", "onRoomListUpdate");

AddCondition(12, cf_trigger, "On actor properties change", "Room", "On actor properties change", "Triggered when actor properties changed.", "onActorPropertiesChange");
AddCondition(13, cf_trigger, "On my room properties change", "Room", "On my room properties change", "Triggered when my room properties changed.", "onMyRoomPropertiesChange");

AddCondition(14, cf_trigger, "On join room", "Room", "On join room", "Triggered when client joins room.", "onJoinRoom");
AddCondition(15, cf_trigger, "On actor join", "Room", "On actor join", "Triggered when new actor joins the room.", "onActorJoin");
AddCondition(16, cf_trigger, "On actor leave", "Room", "On actor leave", "Triggered when actor leaves the room.", "onActorLeave");
AddCondition(17, cf_trigger, "On actor suspend", "Room", "On actor suspend", "Triggered when actor suspended in the room.", "onActorSuspend");
AddCondition(18, cf_trigger, "On WebRPC result", "Lobby & Room", "On WebRpc result", "Triggered when WebRPC request completed.", "onWebRpcResult");

AddCondition(19, cf_trigger, "On FindFriends result", "Lobby", "On FindFriends result", "Triggered when FindFriends request completed. ", "onFindFriendsResult");
AddCondition(20, cf_trigger, "On lobbies statistics update", "Lobby", "On lobbies statistics update", "Triggered when lobbies statistics update received.", "onLobbyStats");
AddCondition(21, cf_trigger, "On application statistics update", "Lobby", "On application statistics update", "Triggered when application statistics update received.", "onAppStats");

AddCondition(22, cf_trigger, "On join lobby", "Lobby", "On join lobby", "Triggered on client joins lobby.", "onJoinedLobby");
AddCondition(23, cf_trigger, "On joinRandomRoom no match found", "Lobby", "On joinRandomRoom no match found", "Triggered when joinRandomRoom called and no match found.", "onJoinRandomRoomNoMatchFound");
AddCondition(24, cf_trigger, "On disconnect", "Client", "On disconnect", "Triggered when client gets disconnected from all servers.", "onDisconnected");

//AddCondition(24, cf_trigger, "", "Lobby", "", "", "onGetRegionsResult";

AddCondition(31, cf_none, "Is connected to Nameserver", "Connection", "Is connected to Nameserver", "True if client connected to Nameserver.", "isConnectedToNameServer");
AddCondition(32, cf_none, "Is connected to Master server", "Connection", "Is connected to Master server", "True if client connected to Master server.", "isConnectedToMaster");
AddCondition(33, cf_none, "Is connected to a lobby", "Connection", "Is connected to a lobby", "True if client connected to a lobby.", "isInLobby");
AddCondition(34, cf_none, "Is joined to a room", "Connection", "Is joined to a room", "True if client joined to a room.", "isJoinedToRoom");

////////////////////////////////////////

// Actions

// AddAction(id,				// any positive integer to uniquely identify this action
//			 flags,				// (see docs) af_none, af_deprecated
//			 list_name,			// appears in event wizard list
//			 category,			// category in event wizard list
//			 display_str,		// as appears in event sheet - use {0}, {1} for parameters and also <b></b>, <i></i>
//			 description,		// appears in event wizard dialog when selected
//			 script_name);		// corresponding runtime function name

// example
//AddStringParam("Message", "Enter a string to alert.");

AddStringParam("UserId", "User id.");
AddAction(0, af_none, "Set user id", "Connection", "Set optional user id to <b>{0}</b>", "Set optional user id (required by some cloud services).", "setUserId");
AddStringParam("AuthParameters", "Parameters expected by the used authentication service.");
AddComboParamOption("Custom", "Custom Default. Use a custom authentification service. ");
AddComboParamOption("Steam", "Steam Authenticates users by their Steam Account. Set auth values accordingly.");
AddComboParamOption("Facebook", "Facebook Authenticates users by their Facebook Account. Set auth values accordingly.");
//AddComboParamOption("None", "Disables custom authentification."); // None = 255 and needs additional mapping from combo list to enum
AddComboParam("AuthType", "The type of custom authentication provider that should be used.");
AddAction(1, af_none, "Set custom authentication", "Connection", "Enable custom authentication of type <b>{1}</b> and set it's parameters to <b>{0}</b>", "Enable custom authentication and set it's parameters.", "setCustomAuthentication");
AddComboParamOption("Photon Cloud");
AddComboParamOption("Self Hosted");
AddComboParam("HostType", "Choose hosting type.");
AddAction(3, af_none, "Set hosting type", "Connection", "Set hosting type to <b>{0}</b>", "Set hosting type.", "setHostingType");
AddStringParam("SelfHostedAddress", "Self Hosted address.");
AddAction(4, af_none, "Set Self Hosted address", "Connection", "Set Self Hosted address to <b>{0}</b>", "Set Self Hosted address.", "setSelfHostedAddress");
AddStringParam("Region", "Region.");
AddAction(5, af_none, "Set region", "Connection", "Set Master server region to <b>{0}</b>", "Set Master server region.", "setRegion");
AddStringParam("App id", "App id.");
AddAction(6, af_none, "Set app id", "Connection", "Set app id to <b>{0}</b>", "Set app id.", "setAppId");
AddStringParam("App version", "App version.");
AddAction(7, af_none, "Set app version", "Connection", "Set app version to <b>{0}</b>", "Set app version.", "setAppVersion");
AddAction(10, af_none, "Connect", "Connection", "Connect to the name server", "Connect to the name server.", "connect");
AddStringParam("Room", "Room name.");
AddStringParam("LobbyName", "Lobby name.");
AddComboParamOption("Default", "This lobby is used unless another is defined by game or JoinRandom. Room-lists will be sent and JoinRandomRoom can filter by matching properties.");
AddComboParamOption("SqlLobby", "This lobby type lists rooms like Default but JoinRandom has a parameter for SQL-like 'where' clauses for filtering. This allows bigger, less, or and and combinations.");
AddComboParam("LobbyType", "Lobby type.");
AddAction(11, af_none, "Create room", "Lobby", "Create room <b>{0}</b> in lobby <b>{1}</b>/<b>{2}</b>", "Crate room.", "createRoom");
AddStringParam("Room", "Room name.");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Rejoin", "Rejoin by current userId");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("CreateIfNotExists", "Create room if it does not exist");
AddStringParam("LobbyName", "Lobby name.");
AddComboParamOption("Default", "This lobby is used unless another is defined by game or JoinRandom. Room-lists will be sent and JoinRandomRoom can filter by matching properties.");
AddComboParamOption("SqlLobby", "This lobby type lists rooms like Default but JoinRandom has a parameter for SQL-like 'where' clauses for filtering. This allows bigger, less, or and and combinations.");
AddComboParam("LobbyType", "Lobby type.");
AddAction(12, af_none, "Join room", "Lobby", "Join room <b>{0}</b> in lobby <b>{3}</b>/<b>{4}</b> (create if not exists: <b>{2}</b>, rejoin: <b>{1}</b>)", "Join room.", "joinRoom");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("MatchMyRoom", "Use my room MaxPlayer and custom properties for matchmaking.");
AddComboParamOption("FillRoom", "Default. Fills up rooms (oldest first) to get players together as fast as possible.");
AddComboParamOption("SerialMatching", "Distributes players across available rooms sequentially but takes filter into account. Without filter, rooms get players evenly distributed.");
AddComboParamOption("RandomMatching", "Joins a (fully) random room. Expected properties must match but aside from this, any available room might be selected.");
AddComboParam("MatchmakingMode", "Matchmaking mode");
AddStringParam("LobbyName", "Lobby name.");
AddComboParamOption("Default", "This lobby is used unless another is defined by game or JoinRandom. Room-lists will be sent and JoinRandomRoom can filter by matching properties.");
AddComboParamOption("SqlLobby", "This lobby type lists rooms like Default but JoinRandom has a parameter for SQL-like 'where' clauses for filtering. This allows bigger, less, or and and combinations.");
AddComboParam("LobbyType", "Lobby type.");
AddStringParam("SqlLobbyFilter", "SqlLobby filter.");
AddAction(13, af_none, "Join random room", "Lobby", "Join random room by <b>{1}</b> matching my room: <b>{0}</b> in lobby <b>{2}</b>/<b>{3}</b> with filter <b>{4}</b>", "Join random room.", "joinRandomRoom");
AddAction(14, af_none, "Disconnect", "Connection", "Disconnect from all servers", "Disconnect from all servers.", "disconnect");
AddAction(15, af_none, "Suspend room", "Connection", "Disconnect client from Game server keeping player in room", "Disconnect client from Game server keeping player in room (to rejoin later) and connect to Master server if not connected.", "suspendRoom");
AddAction(16, af_none, "Leave room", "Connection", "Leave room", "Leave room and connect to Master server if not connected.", "leaveRoom");
AddNumberParam("Code", "Identifies this type of event.");
AddAnyTypeParam("Data", "Custom data you want to send along.");
AddNumberParam("InterestGroup", "The ID of the interest group this event goes to.");
AddComboParamOption("DoNotCache", "Default. Do not cache.");
AddComboParamOption("MergeCache", "Will merge this event's keys with those already cached.");
AddComboParamOption("ReplaceCache", "Replaces the event cache for this eventCode with this event's content.");
AddComboParamOption("RemoveCache", "Removes this event (by eventCode) from the cache.");
AddComboParamOption("AddToRoomCache", "Adds an event to the room's cache.");
AddComboParamOption("AddToRoomCacheGlobal", "Adds this event to the cache for actor 0 (becoming a \"globally owned\" event in the cache).");
AddComboParamOption("RemoveFromRoomCache", "Remove fitting event from the room's cache.");
AddComboParamOption("RemoveFromRoomCacheForActorsLeft", "Removes events of players who already left the room (cleaning up).");
AddComboParam("Cache", "Caching options for events.");
AddComboParamOption("Others", "Default. Anyone else gets my event.");
AddComboParamOption("All", "Everyone in the current room (including this peer) will get this event.");
AddComboParamOption("MasterClient", "The \"master client\" does not have special rights but is the one who is in this room the longest time.");
AddComboParam("Receivers", "Defines to which group of players the event is passed on.");
AddStringParam("TargetActors", "Comma-separated list of target actors (who should receive the event) id's. Use only for small target groups. Send to all if empty."); // number[]
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("WebForward", "Forward to web hook.");
AddAction(17, af_none, "Raise event", "Room", "Raise game event <b>{0}</b> with <b>{1}</b> payload to <b>{4}</b>, target <b>{5}</b>, group <b>{2}</b> (<b>{3}</b>, forward: <b>{6}</b>)", "Raise game event.", "raiseEvent");
AddComboParamOption("Add");
AddComboParamOption("Add all current");
AddComboParamOption("Remove");
AddComboParamOption("Remove all");
AddComboParam("Action", "Group action.");
AddNumberParam("Group", "Group to add or remove.");
AddAction(18, af_none, "Change groups", "Room", "<b>{0}</b> interest group <b>{1}</b>", "Change client's interest group.", "changeGroups");

AddStringParam("UriPath", "Remote procedure uri path.");
AddStringParam("Parameters", "Remote procedure parameters.");
AddComboParamOption("String");
AddComboParamOption("JSON");
AddComboParam("ParametersType", "Parameters type.");
AddAction(19, af_none, "Call WebRpc", "Lobby & Room", "Call remote procedure (WebRPC) <b>{0}</b> with <b>{1}</b> as <b>{2}</b>", "Call remote procedure (WebRPC).", "webRpc");

AddStringParam("Friends", "Comma-separated list of friends user id's");
AddAction(31, af_none, "Find friends", "Lobby", "Request status of friends <b>{0}</b> (FindFriends)", "Request Master server for friends online status and joined rooms (FindFriends).", "findFriends");
AddAction(41, af_none, "Request lobby stats", "Lobby", "Request lobbies statistics", "Request Master server for lobbies statistics.", "requestLobbyStats");
//getRegions

AddStringParam("name", "Actor name.");
AddAction(101, af_none, "Set my actor name", "Actor", "Set name of local actor to <b>{0}</b>", "Set name of local actor.", "setMyActorName");

AddNumberParam("ActorNr", "Actor number.");
AddStringParam("PropName", "Property Name.");
AddAnyTypeParam("Value", "Property value.");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("WebForward", "Forward to web hook.");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("CheckAndSet", "Set only if old equals to expected.");
AddAnyTypeParam("ExpectedValue", "Expected property value.");
AddAction(102, af_none, "Set property of actor by nr.", "Actor", "Set actor <b>{0}</b> custom property <b>{1}</b> to <b>{2}</b> (forward: <b>{3}</b>, check <b>{5}</b>: <b>{4}</b>)", "Set custom property of actor.", "setPropertyOfActorByNr");

AddStringParam("PropName", "Property Name.");
AddAnyTypeParam("Value", "Property value.");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("WebForward", "Forward to web hook.");
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("CheckAndSet", "Set only if old equals to expected.");
AddAnyTypeParam("ExpectedValue", "Expected property value.");
AddAction(103, af_none, "Set property of my room", "Room", "Set custom property <b>{0}</b> of my room to <b>{1}</b> (forward: <b>{2}</b>, check <b>{4}</b>: <b>{3}</b>)", "Set custom property of my room.", "setPropertyOfMyRoom");

AddStringParam("PropNames", "Comma-separated list of properties mames to be listed in lobby."); // number[]
AddAction(104, af_none, "Set props listed in lobby", "Room", "Set properties listed in lobby to <b>{0}</b>", "Set properties listed in lobby.", "setPropsListedInLobby");

AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("IsVisible", "New visibility value.", 1);
AddAction(105, af_none, "Set my room is visible", "Room", "Set rooms visibility to <b>{0}</b>", "Set rooms visibility in the lobby's room list.", "setMyRoomIsVisible");

AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("IsOpen", "New property value.", 1);
AddAction(106, af_none, "Set my room is open", "Room", "Set room open status to <b>{0}</b>", "Set if this room can be joined.", "setMyRoomIsOpen");

AddNumberParam("MaxPlayers", "New max players value.");
AddAction(107, af_none, "Set my room max players", "Room", "Set room max players to <b>{0}</b>", "Set max players before room is considered full.", "setMyRoomMaxPlayers");

AddNumberParam("EmptyRoomLiveTime", "New live time value in ms.");
AddAction(108, af_none, "Set empty room live time", "Room", "Set room live time to <b>{0}</b>", "Set room live time in the server room cache after all clients have left the room.", "setEmptyRoomLiveTime");

AddNumberParam("SuspendedPlayerLiveTime", "New live time value in ms.");
AddAction(109, af_none, "Set suspended player live time", "Room", "Set suspended player live time to <b>{0}</b>", "Set time in ms indicating how long suspended player will be kept in the room.", "setSuspendedPlayerLiveTime");

// Deprecated
AddComboParamOption("No");
AddComboParamOption("Yes");
AddComboParam("Unique", "New property value.", 0);
AddAction(110, af_deprecated, "Set unique userid check", "Room", "Set user id check to to <b>{0}</b>", "Activates user id checks on joining if set to true.", "setUniqueUserId");

AddAction(201, af_none, "Reset", "Common", "Reset", "Disconnects and creates new client instance.", "reset");

////////////////////////////////////////
// Expressions

// AddExpression(id,			// any positive integer to uniquely identify this expression
//				 flags,			// (see docs) ef_none, ef_deprecated, ef_return_number, ef_return_string,
//								// ef_return_any, ef_variadic_parameters (one return flag must be specified)
//				 list_name,		// currently ignored, but set as if appeared in event wizard
//				 category,		// category in expressions panel
//				 exp_name,		// the expression name after the dot, e.g. "foo" for "myobject.foo" - also the runtime function name
//				 description);	// description in expressions panel

// example
AddExpression(10, ef_return_number, "ErrorCode", "Client", "ErrorCode", "Last error code.");
AddExpression(20, ef_return_string, "ErrorMessage", "Client", "ErrorMessage", "Last error message.");
AddExpression(30, ef_return_number, "State", "Connection", "State", "Current client state.");
AddExpression(40, ef_return_string, "StateString", "Connection", "StateString", "Current client state string.");
AddExpression(50, ef_return_string, "UserId", "Connection", "UserId", "Previously set user id.");
AddExpression(60, ef_return_number, "MyActorNr", "Room", "MyActorNr", "Local actor number.");
AddExpression(70, ef_return_string, "MyRoomName", "Lobby", "MyRoomName", "Currently my room name.");
AddExpression(80, ef_return_number, "EventCode", "Room", "EventCode", "Last Photon event code.");
AddExpression(90, ef_return_string, "EventData", "Room", "EventData", "Last Photon event data.");
AddExpression(100, ef_return_number, "ActorNr", "Room", "ActorNr", "Actor number.");
AddExpression(110, ef_return_number, "RoomCount", "Lobby", "RoomCount", "Count of rooms available.");
AddNumberParam("Index", "Room index.");
AddExpression(120, ef_return_string, "RoomNameAt", "Lobby", "RoomNameAt", "Name of room at index.");
AddStringParam("Name", "Room name.");
AddExpression(130, ef_return_number, "RoomMaxPlayers", "Lobby", "RoomMaxPlayers", "Max players before room is considered full");
AddStringParam("Name", "Room name.");
AddExpression(140, ef_return_number, "RoomIsOpen", "Lobby", "RoomIsOpen", "Defines if this room can be joined.");
AddStringParam("Name", "Room name.");
AddExpression(150, ef_return_number, "RoomPlayerCount", "Lobby", "RoomPlayerCount", "Count of player currently in room.");
AddStringParam("Name", "Room name.");
AddStringParam("PropName", "Property name.");
AddExpression(155, ef_return_any, "RoomProperty", "Lobby", "RoomProperty", "Room property.");

AddStringParam("PropName", "Property name.");
AddExpression(160, ef_return_any, "PropertyOfMyRoom", "Room", "PropertyOfMyRoom", "Property of my room.");

AddExpression(170, ef_return_number, "ActorCount", "Room", "ActorCount", "Count of actors in room.");
AddNumberParam("Index", "Actor index.");
AddExpression(180, ef_return_number, "ActorNrAt", "Room", "ActorNrAt", "Actor number of actor at index.");
AddNumberParam("Index", "Actor index.");
AddExpression(190, ef_return_string, "ActorNameByNr", "Room", "ActorNameByNr", "Name of actor by number.");
AddNumberParam("ActorNr", "Actor number.");
AddStringParam("PropName", "Property name");
AddExpression(200, ef_return_any, "PropertyOfActorByNr", "Room", "PropertyOfActorByNr", "Property of actor by number.");

AddExpression(210, ef_return_number, "ChangedPropertiesCount", "Room", "ChangedPropertiesCount", "Changed properties count.");
AddNumberParam("Index", "Property index.");
AddExpression(220, ef_return_any, "ChangedPropertyNameAt", "Room", "ChangedPropertyNameAt", "Changed property name at index.");

AddExpression(240, ef_return_number, "MasterActorNr", "Room", "MasterActorNr", "Actor number of room master.");

AddExpression(310, ef_return_string, "WebRpcUriPath", "Room", "WebRpcUriPath", "Request path of WrbRpc which triggered OnWebRpc condition.");
AddExpression(320, ef_return_number, "WebRpcResultCode", "Room", "WebRpcResultCode", "Result code returned by remote procedure.");
AddExpression(330, ef_return_any, "WebRpcData", "Room", "WebRpcData", "Data returned by remote procedure.");

AddStringParam("Name", "Friend name.");
AddExpression(410, ef_return_number, "FriendOnline", "Lobby", "FriendOnline", "True if friend is online.");
AddStringParam("Name", "Friend name.");
AddExpression(420, ef_return_string, "FriendRoom", "Lobby", "FriendRoom", "Currently joined room name or empyt string.");

AddExpression(510, ef_return_number, "LobbyStatsCount", "Lobby", "LobbyStatsCount", "Count of lobbies statistics entries.");
AddNumberParam("Index", "Lobby index.");
AddExpression(520, ef_return_string, "LobbyStatsNameAt", "Lobby", "LobbyStatsNameAt", "Lobby name.");
AddNumberParam("Index", "Lobby index.");
AddExpression(530, ef_return_string, "LobbyStatsTypeAt", "Lobby", "LobbyStatsTypeAt", "Lobby type.");
AddNumberParam("Index", "Lobby index.");
AddExpression(540, ef_return_number, "LobbyStatsPeerCountAt", "Lobby", "LobbyStatsPeerCountAt", "Number of players in the lobby (on Master, not playing).");
AddNumberParam("Index", "Lobby index.");
AddExpression(550, ef_return_number, "LobbyStatsGameCountAt", "Lobby", "LobbyStatsGameCountAt", "Number of games in the lobby.");


AddExpression(610, ef_return_number, "AppStatsPeerCount", "Lobby", "AppStatsPeerCount", "Count of players currently online on Game servers.");
AddExpression(620, ef_return_number, "AppStatsMasterPeerCount", "Lobby", "AppStatsMasterPeerCount", "Count of players on Master server (looking for game).");
AddExpression(630, ef_return_number, "AppStatsGameCount", "Lobby", "AppStatsGameCount", "Count of games currently in use (includes invisible and full rooms, so it doesn't match lobby list).");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Array of property grid properties for this plugin
// new cr.Property(ept_integer,		name,	initial_value,	description)		// an integer value
// new cr.Property(ept_float,		name,	initial_value,	description)		// a float value
// new cr.Property(ept_text,		name,	initial_value,	description)		// a string
// new cr.Property(ept_color,		name,	initial_value,	description)		// a color dropdown
// new cr.Property(ept_font,		name,	"Arial,-16", 	description)		// a font with the given face name and size
// new cr.Property(ept_combo,		name,	"Item 1",		description, "Item 1|Item 2|Item 3")	// a dropdown list (initial_value is string of initially selected item)
// new cr.Property(ept_link,		name,	link_text,		description, "firstonly")		// has no associated value; simply calls "OnPropertyChanged" on click

var property_list = [
	new cr.Property(ept_text, 	"AppId",				"<app-id>",			"Application id."),
	new cr.Property(ept_text, 	"AppVersion", 			"1.0",				"Application version."),
	new cr.Property(ept_combo, 	"Protocol",				"ws",				"Connection protocol.", "ws|wss"),
	new cr.Property(ept_combo, 	"Region",				"eu",				"Master server region.", "eu|us|asia|jp|au|usw|sa|cae|kr|in|cn|ru|rue"),
	new cr.Property(ept_combo, 	"HostType",				"Photon Cloud",		"Hosting type.", "Photon Cloud|Self Hosted"),
	new cr.Property(ept_text, 	"SelfHostedAddress",	"localhost:9090",	"Self Hosted server address."),
	new cr.Property(ept_combo, 	"LogLevel",				"INFO",				"Logging level.", "DEBUG|INFO|WARN|ERROR|OFF")
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
	return new IDEInstance(instance);
};

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
		
	// Plugin-specific variables
	// this.myValue = 0...
};

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
};

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
};

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
};

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
};

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
};

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
};