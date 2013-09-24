if(typeof com == 'undefined') com = {};
if(typeof com.snapstick == 'undefined') com.snapstick = {};
if(typeof com.snapstick.api == 'undefined') com.snapstick.api = {};
if(typeof com.snapstick.api.game == 'undefined') com.snapstick.api.game = {};

// common api for snapstick related functions
com.snapstick.api.game.common = {
    
    // These Types are used in communication between game client and game platform. 
    MESSAGE_TYPE: "type",
    MESSAGE_DATA: "data",
    MESSAGE_TYPE_NATIVE: "native",
    MESSAGE_TYPE_CONNECT: "connect",
    MESSAGE_TYPE_ADD_CAPABILITIES: "capabilities",
    MESSAGE_TYPE_START: "start",
    MESSAGE_TYPE_QUIT: "quit",
    MESSAGE_TYPE_RESTART: "restart",
    MESSAGE_TYPE_END: "end",
    MESSAGE_TYPE_PLAYERS_QUEUE: "playersQueue",
    MESSAGE_TYPE_CUSTOM: "custom",
    MESSAGE_TYPE_P2P: "p2pClientExchange",
    MESSAGE_TYPE_CLOSE_TABS: "close_tabs",
    MESSAGE_TYPE_SCROLL_WINDOW: "scroll_window",
    MESSAGE_TYPE_DOM_FOCUS: "dom_focus",
    MESSAGE_TYPE_PORTAL_HELP_SHOW_DONE: "snapstick.app.help.show_done",
    MESSAGE_TYPE_PORTAL_HELP_SET: "snapstick.app.help.set",
    MESSAGE_TYPE_OBJECT_RELATIVE: "relative",
    MESSAGE_TYPE_OBJECT_ABSOLUTE: "absolute",
    MESSAGE_TYPE_DISCONNECT: "disconnect",
    MESSAGE_TYPE_GETCLIENTID: "getclientid",
    MESSAGE_TYPE_PORTAL_DATA: "portaldata",
    MESSAGE_TYPE_DASHBOARD: "dashboard",
    MESSAGE_TYPE_DASHBOARD_LOAD: "dashboard_load",
    MESSAGE_TYPE_OVERLAY_HIDE: "overlay_hide",
    MESSAGE_TYPE_OVERLAY_SHOW: "overlay_show",
    MESSAGE_TYPE_OVERLAY_TOGGLE: "overlay_toggle",
    MESSAGE_TYPE_NATIVECALL: "snapstick.nativecall",
    MESSAGE_TYPE_PLATFORMREADY: "snapstick.platformready",
    MESSAGE_TYPE_NATIVEDATA: "snapstick.nativedata",
    MESSAGE_TYPE_SOCIAL_FB_POST: "social_fb",
    MESSAGE_TYPE_CONTROLLER_SNAP_REQUEST: "controller_snap_request",
    MESSAGE_TYPE_CLIENT_LIST_FROM_PORTAL: "clientListFromPortal",
    MESSAGE_TYPE_GETCLIENTLIST: "clientListRequestFromController",
    MESSAGE_TYPE_CLIENT_CONNECT_FROM_PORTAL: "clientConnectFromPortal",
    MESSAGE_TYPE_CLIENT_DISCONNECT_FROM_PORTAL: "clientDisconnectFromPortal",
    GESTURE_SWIPE: "gesture.swipe",
    GESTURE_SWING: "gesture.swing",
    TYPE_KEYBOARD: 8,
    TYPE_BROWSER_CONTROL: 10,
    TYPE_BROWSER_CONTROL_BACK: 11,    
    TYPE_BROWSER_CONTROL_FORWARD: 12,    
    ESCAPE_ASCII_VALUE: 27,    
    
    CONTENT_TO_CHROME_EVENT: "com.snapstick.api.game.pushData",
    CHROME_TO_CONTENT_EVENT: "com.snapstick.api.game.receiveData",
    CLIENT_CONNECT_EVENT: "com.snapstick.api.game.clientConnect",
    CLIENT_DISCONNECT_EVENT: "com.snapstick.api.game.clientDisconnect",
    CLIENT_LIST_EVENT: "com.snapstick.api.game.clientList",
    CUSTOM_MESSAGE_EVENT: "customMessage",
    P2P_MESSAGE_EVENT: "p2pClientMessage",
    GAME_CONTROL_MESSAGE_EVENT: "gameControlMessage",
    GAME_CONTROL_START_EVENT: "snapstick.start",
    GAME_CONTROL_RESTART_EVENT: "snapstick.restart",
    GAME_CONTROL_END_EVENT: "snapstick.end",
    GAME_CONTROL_QUEUE_EVENT: "snapstick.queueStatusUpdate",
    OPEN_OAUTH_WINDOW: "snapstick.openoauth",
    PORTAL_HELP_DATA_RECEIVED: "snapstick.helpDataReceived",
    SCREEN_CHANGED_EVENT: "snapstick.screenChanged",
    DASHBOARD_EVENT: "snapstick.dashboard",
    DASHBOARD_CLIENT_CONNECT_EVENT: "snapstick.dashboard.clientConnect",
    DASHBOARD_CLIENT_DISCONNECT_EVENT: "snapstick.dashboard.clientDisconnect",
    DASHBOARD_CONNECTED_CLIENT_LIST_EVENT: "snapstick.dashboard.clientList",
    ON_ORIENTTATION_CHANGE: "orientationchange",
	SOCIAL_PROFILE_DATA: "facebookdata",
    DEVICE_PROFILE_DATA: "devicedata",
    CLIENT_PROFILE_DATA: "clientdata",
	TYPE_VOLUME_CHANGE: "20",
	TYPE_CHUNK_FINISH: 151,
    DS_CODE_CHANGED_EVENT: "snapstick.update_ds_code",
	
	isEmpty: function(param){
		if(typeof param == 'undefined' || param == undefined || param == null || param == 'undefined'){
			return true;
		}
		return false;
	},	  	
 
	callInClosure: function (context) {
		var co = {
			callMethod: function (method) {
				if (typeof method == 'string') method = context[method];
				var cb = function () { 
					if(method != null)
						method.apply(context, arguments); 
				}
				return cb;
			}
		};
		return co;
	},    
};
