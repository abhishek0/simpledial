com.snapstick.api.game.server = {
	COMMUNICATION_ELEMENT_NAME: "snapstickDummyDataElement",
	COMMUNICATION_ELEMENT: undefined,
	MESSAGE_RECEIVE_ELEMENT_NAME: "snapstickDummyDataReceiveElement",
	MESSAGE_RECEIVE_ELEMENT: undefined,

	max_num_players: 2,
	curr_num_players: 0,
	players_queue: null,
	mid_game_join: true,
	callBackMaps: {},

    event_queue: [],
    
    Queue: function() {},
    
	init: function() {
        this.players_queue = new this.Queue();
        // TODO For now setting max players to queue size. 
        this.max_num_players = this.players_queue.max_length;
        this.players_queue.max_num_players = this.players_queue.max_length;        
        var uagent = window.navigator.userAgent;
        var customRegex = /(sidereel|snapstick|allplay)/i
        var ffRegex = /firefox/i
        // Check if query string contains inWrapper, means server app is running inside an iframe, so we will setup postMessage communication
        if (window.location.href.indexOf('inWrapper=true') > 0) {
             this.webdsOrWrapperInit();
             return;
        }
        if (typeof uagent != 'undefined' && uagent != undefined && (uagent.indexOf('iPhone') >= 0 || uagent.indexOf('iPod') >= 0 || uagent.indexOf('iPad') >= 0)) {
            this.ds_type = 'ios';
            var self = this;
            var func = function(){
                window.addEventListener(com.snapstick.api.game.common.CHROME_TO_CONTENT_EVENT, com.snapstick.api.game.common.callInClosure(self).callMethod(self.receivedDataFromController), false);
                var wrapper = {};
                wrapper.type = 0;
                self.sendData(wrapper);
            }
            jQuery.getScript('http://f2.snapstick.com/static/js/communication-bridge.js', func);
            return;
        }
        else if (typeof uagent != 'undefined' && uagent != undefined && uagent.indexOf('Snapstick_Android_Display_Server') >= 0) {
            this.ds_type = 'android';
            window.addEventListener(com.snapstick.api.game.common.CHROME_TO_CONTENT_EVENT, com.snapstick.api.game.common.callInClosure(this).callMethod(this.receivedDataFromController), false);
            var wrapper = {};
            wrapper.type = 0;
            this.sendData(wrapper);
            return;
        }        
        else if (typeof uagent != 'undefined' && uagent != undefined && customRegex.test(uagent) && ffRegex.test(uagent)) {
            this.ds_type = 'firefox';
        }
        else {
            //This is from a web version. Any other way to identify this?
            this.webdsOrWrapperInit();
            return;
        }
		this.COMMUNICATION_ELEMENT = document.createElement(this.COMMUNICATION_ELEMENT_NAME);
        this.COMMUNICATION_ELEMENT.setAttribute("id", this.COMMUNICATION_ELEMENT_NAME);
		document.documentElement.appendChild(this.COMMUNICATION_ELEMENT);
		this.MESSAGE_RECEIVE_ELEMENT = document.createElement(this.MESSAGE_RECEIVE_ELEMENT_NAME);
		this.MESSAGE_RECEIVE_ELEMENT.setAttribute("id",this.MESSAGE_RECEIVE_ELEMENT_NAME);
		document.documentElement.appendChild(this.MESSAGE_RECEIVE_ELEMENT);
		window.addEventListener(com.snapstick.api.game.common.CHROME_TO_CONTENT_EVENT, com.snapstick.api.game.common.callInClosure(this).callMethod(this.receivedDataFromController), false);
		var wrapper = {};
		wrapper.type = 0;
		this.sendData(wrapper);
	},

	webdsOrWrapperInit: function(){
		this.ds_type = 'web';
		window.addEventListener('message', com.snapstick.api.game.common.callInClosure(this).callMethod(this.receivedDataFromController), false);
		var wrapper = {};
		wrapper.type = 0;	
		this.sendData(wrapper);
	},

	receivedDataFromController: function(evt){
		try {
            if(this.ds_type == 'ios' || this.ds_type == 'android'){
                this.processStringFromController(evt.message);
            } else if (this.ds_type == 'web') {
                this.processStringFromController(evt.data);
            } else {
                var dataNode = this.MESSAGE_RECEIVE_ELEMENT.removeChild(this.MESSAGE_RECEIVE_ELEMENT.firstChild);
                if (typeof dataNode != 'undefined' && dataNode != null){
                    this.processStringFromController(dataNode.event);
                }
            }
		} catch (err) {
		
		}
	},
	
	processStringFromController: function(jsonData){
		var event = JSON.parse(jsonData);
		if(event.toe == com.snapstick.api.game.common.CLIENT_CONNECT_EVENT) {
			d = new Date();console.log('received client connect ' + d);
			var node = this.players_queue.push(event.clientId, event.clientData);
			if (node == null || typeof node == 'undefined') {
				//Queue is full. Send a message to controller and ask to disconnect.
				var message={};
				message.type = com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT;
				message.message = "overloaded";
				this.sendDataToController(event.clientId, message);
				return;
			}
			console.log(this.players_queue.clientIdNodeMap);
			if (this.curr_num_players < this.max_num_players && this.mid_game_join) {
				node.inGame = true;
				node.isMidGame = true;
				this.players_queue.raiseQueueUpdateEvent();
				this.curr_num_players++;
				console.log('dispatching message to game');
				var ev = document.createEvent("Events");
				ev.initEvent(com.snapstick.api.game.common.CLIENT_CONNECT_EVENT,true,false);
				ev.clientId = event.clientId;
				ev.clientData = event.clientData;
				document.dispatchEvent(ev);
			}
			else {
				node.inGame = false;
				this.players_queue.raiseQueueUpdateEvent();
			}
			d = new Date();console.log('Queuing done ' + d);
		} else if (event.toe == com.snapstick.api.game.common.CLIENT_DISCONNECT_EVENT) {
			var d = new Date();console.log('Received disconnect ' + d);
			var node = this.players_queue.getNodeByClientId(event.clientId);
			node.status = "DISCONNECTED";
			if (node.inGame == true) {
				this.players_queue.remove(node);
				var d = new Date();console.log('Player removed from q ' + d);
				this.players_queue.raiseQueueUpdateEvent();
				var ev = document.createEvent("Events");
				ev.initEvent(com.snapstick.api.game.common.CLIENT_DISCONNECT_EVENT,true,false);
				ev.clientId = event.clientId;
				document.dispatchEvent(ev);
				this.curr_num_players--;

				//If mid game joining is true get the next person in queue and pass to game.
				if (this.mid_game_join) {
					var d = new Date();console.log('getting next player from q ' + d);
					var node = this.players_queue.getNextWaiting();
					if (node != null) {
						var d = new Date();console.log('found player in q ' + d);
						node.inGame = true;
						node.isMidGame = true;
						this.players_queue.raiseQueueUpdateEvent();

						var ev = document.createEvent("Events");
						ev.initEvent(com.snapstick.api.game.common.CLIENT_CONNECT_EVENT,true,false);
						ev.clientId = node.clientId;
						ev.clientData = node.data;
						document.dispatchEvent(ev);
						this.curr_num_players++;
					}
				}
			}
			this.players_queue.raiseQueueUpdateEvent();
		} else if (event.toe == com.snapstick.api.game.common.CUSTOM_MESSAGE_EVENT) {
			var ev = document.createEvent("Events");
			ev.initEvent(com.snapstick.api.game.common.CUSTOM_MESSAGE_EVENT,true,false);
			ev.clientId = event.clientId;
			ev.data = event.data;
			document.dispatchEvent(ev);
		} else if (event.toe == com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT) {
			console.log('Received ' + JSON.stringify(event.data));
			if (event.data.name == "snapstick.playersQueue") {
				var message={};
				message.type = com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT;
				message.message = "completeQueue";
				message.players = this.players_queue.serializeQueue();
				message.maxNumPlayers;
				this.sendDataToController(event.clientId, message);
			} else {
				var ev = document.createEvent("Events");
				ev.initEvent(event.data.name,true,false);
				ev.clientId = event.clientId;
				ev.data = event.data.data;            
				document.dispatchEvent(ev);
			}
		} else if (event.toe == com.snapstick.api.game.common.CLIENT_LIST_EVENT){
			//When is this called and what to do here.
			console.log('client list event received');
			var inGameCls = {};
			for (var clid in event.data) {
				var cl = event.data[clid];
				var node = this.players_queue.push(clid, cl);
				if (node == null || typeof node == 'undefined') {
					//Queue is full. Send a message to controller and ask to disconnect.
					var message={};
					message.type = com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT;
					message.message = "overloaded";
					this.sendDataToController(clid, message);
				}
				else {
					if (this.curr_num_players < this.max_num_players && this.mid_game_join) {
						node.inGame = true;
						node.isMidGame = false;
						inGameCls[clid] = cl;
						this.curr_num_players++;
					}
					else {
						node.inGame = false;
					}
				}
			}
			if (Object.keys(inGameCls).length > 0) {
				this.players_queue.raiseQueueUpdateEvent();
				var ev = document.createEvent("Events");
				ev.initEvent(com.snapstick.api.game.common.CLIENT_LIST_EVENT,true,false);
				ev.data = inGameCls;
				document.dispatchEvent(ev);
			}
		} else if (event.toe == com.snapstick.api.game.common.DEVICE_MOTION_EVENT) {
			var ev = document.createEvent("Events");
			ev.initEvent(com.snapstick.api.game.common.DEVICE_MOTION_EVENT,true,false);
			ev.clientId = event.clientId;
			event = event.data;
			if(event.interval != undefined)
				ev.interval = event.interval;
			if(event.acceleration != undefined)
			{
				ev.acceleration = new Object();
				ev.acceleration.x = event.acceleration.x;
				ev.acceleration.y = event.acceleration.y;
				ev.acceleration.z = event.acceleration.z;
			}
			if(event.accelerationIncludingGravity != undefined)
			{
				ev.accelerationIncludingGravity = new Object();
				ev.accelerationIncludingGravity.x = event.accelerationIncludingGravity.x; 
				ev.accelerationIncludingGravity.y = event.accelerationIncludingGravity.y;
				ev.accelerationIncludingGravity.z = event.accelerationIncludingGravity.z; 
			}
			if(event.rotationRate != undefined)
			{
				ev.rotationRate = new Object();
				ev.rotationRate.alpha = event.rotationRate.alpha;
				ev.rotationRate.beta = event.rotationRate.beta;
				ev.rotationRate.gamma = event.rotationRate.gamma;
			}
			if(event.relativeRotation != undefined)
			{
				ev.relativeRotation = new Object();
				ev.relativeRotation.x = event.relativeRotation.x;
				ev.relativeRotation.y = event.relativeRotation.y;
				ev.relativeRotation.z = event.relativeRotation.z;
			}
			document.dispatchEvent(ev);
	        } else if (event.toe == com.snapstick.api.game.common.SCREEN_CHANGED_EVENT) {
			var ev = document.createEvent("Events");
			ev.initEvent(com.snapstick.api.game.common.SCREEN_CHANGED_EVENT,true,false);
			document.dispatchEvent(ev);
		} else if (event.toe == "customevent") {

		} else if (event.toe == com.snapstick.api.game.common.DS_CODE_CHANGED_EVENT){
			var ev = document.createEvent("Events");
			ev.initEvent(com.snapstick.api.game.common.DS_CODE_CHANGED_EVENT,true,false);
            ev.data = event.data;
			document.dispatchEvent(ev);
        }
	},
    
	sendData: function(data){
		if (this.ds_type == 'android') {
			window.JAVA_OBJ.sendDataToStaticViewFromGame(JSON.stringify(data));
			return;
		} else if (this.ds_type == 'ios'){
                    if(typeof snapstick != 'undefined' && snapstick != null) {
                        while(this.event_queue.length > 0 ){
                            snapstick.bridge.exec(undefined, undefined, "StaticView","event", [JSON.stringify(this.event_queue.shift())]);
                        }
                        snapstick.bridge.exec(undefined, undefined, "StaticView","event", [JSON.stringify(data)]);
                    } else {
                        this.event_queue.push(data);
                    }
                    return;
		} else if (this.ds_type == 'web') {
			parent.postMessage(JSON.stringify(data),'*');
			return;
		}
		if(typeof this.COMMUNICATION_ELEMENT == 'undefined') {
			this.init();
		}
    if(typeof this.COMMUNICATION_ELEMENT != 'undefined'){
      var mesgElement = document.createElement("mesgElement");
      mesgElement.message = JSON.stringify(data);
      this.COMMUNICATION_ELEMENT.appendChild(mesgElement);
      var evt = document.createEvent("Events");
      evt.initEvent(com.snapstick.api.game.common.CONTENT_TO_CHROME_EVENT, true, false);
      this.COMMUNICATION_ELEMENT.dispatchEvent(evt);
    }  
	},
	
	sendDataToController: function(controllerId, message){
		var wrapper = {};
		wrapper.controllerId = controllerId;
		wrapper.data = message;
		wrapper.type = 6;
		console.log(JSON.stringify(wrapper));
		this.sendData(wrapper);
	},

	displayGameMessage: function(msg) {
		var wrapper = {};
		wrapper.data = msg;
		wrapper.type = 22;
		this.sendData(wrapper);
	},
	
	getClientList: function(){
		console.log('called getClientList');
		var wrapper = {};
		wrapper.type = 2;
		this.sendData(wrapper);
	},

	sendCustomMessage: function(controllerId, data){
		var wrapper = {};   
		wrapper.type = com.snapstick.api.game.common.MESSAGE_TYPE_CUSTOM;
		wrapper.payload = data;
		this.sendDataToController(controllerId,wrapper);
	},
	
	sendGameStart: function(data){
		var wrapper = {};   
		wrapper.type = com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT;
		wrapper.name = com.snapstick.api.game.common.GAME_CONTROL_START_EVENT;
		wrapper.payload = data;
		this.sendDataToController(-1,wrapper);
	},
    
	sendGameRestart: function(data){
		var wrapper = {};   
		wrapper.type = com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT;
		wrapper.name = com.snapstick.api.game.common.GAME_CONTROL_RESTART_EVENT;
		wrapper.payload = data;
		this.sendDataToController(-1,wrapper);
	},
    
	sendGameEnd: function(data){
		//Check if this is a game end message. We need to do queue munging here.
		console.log('queue munging needed');
		var newPlayers = [];
		var leavingPlayers = [];
		while(true) {
			var node = this.players_queue.front();
			if (node != null && node.inGame == true && node.isMidGame == false) {
				var node = this.players_queue.popFront();
				leavingPlayers.push(node);
				console.log('disconnecting ' + node.clientId);
				node.inGame = false;
				node.isMidGame = false;
				node.next=null;
				node.prev=null;
				this.players_queue.push(node.clientId, node.data);
				this.curr_num_players--;
			}
			else
				break;
		}

		console.log(newPlayers);
		if (this.mid_game_join)
			this.players_queue.resetMidGame();

		while(this.curr_num_players < this.max_num_players) {
			var node = this.players_queue.getNextWaiting();
			if (typeof node != 'undefined' && node != null) {
				node.inGame = true;
				node.isMidGame = false;
				newPlayers.push(node);
				this.curr_num_players++;
				console.log('adding ' + node.clientId);
			}
			else
				break;
		}

		console.log(leavingPlayers);
		for (var i=0; i < leavingPlayers.length; ++i) {
			var node = leavingPlayers[i];
			var ev = document.createEvent("Events");
			ev.initEvent(com.snapstick.api.game.common.CLIENT_DISCONNECT_EVENT,true,false);
			ev.clientId = node.clientId;
			document.dispatchEvent(ev);
		}

		//First raise queue update event and then add in game
		this.players_queue.raiseQueueUpdateEvent();
		for (var i=0; i < newPlayers.length; ++i) {
			var node = newPlayers[i];
			var ev = document.createEvent("Events");
			ev.initEvent(com.snapstick.api.game.common.CLIENT_CONNECT_EVENT,true,false);
			ev.clientId = node.clientId;
			ev.clientData = node.data;
			document.dispatchEvent(ev);
		}
		var wrapper = {};   
		wrapper.type = com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT;
		wrapper.name = com.snapstick.api.game.common.GAME_CONTROL_END_EVENT;
		wrapper.payload = data;
		this.sendDataToController(-1,wrapper);
	},

	finish: function(data) {
	    var wrapper = {};
	    wrapper.type = com.snapstick.api.game.common.TYPE_CHUNK_FINISH;
	    wrapper.data = data;
	    this.sendData(wrapper);
	},
	
    sendNativeMessage: function(data) {
	    var wrapper = {};
	    wrapper.type = 111;
        wrapper.data = data;
	    this.sendData(wrapper);
    },

    getDSCode: function() {
	    var wrapper = {};
	    wrapper.type = 110;
	    this.sendData(wrapper);
    },

    showMouse: function(data) {
	    var wrapper = {};
	    wrapper.type = 112;
        wrapper.data = data;
	    this.sendData(wrapper);
    },
    
	sendOverlayShow: function() {
	    var wrapper = {};
	    wrapper.type = 106;
	    this.sendData(wrapper);
	},
	sendOverlayHide: function() {
	    var wrapper = {};
	    wrapper.type = 104;
	    this.sendData(wrapper);
	},
	sendOverlayToggle: function() {
	    var wrapper = {};
	    wrapper.type = 105;
	    this.sendData(wrapper);
	},
	sendAppQuit: function() {
        var wrapper = {};
        wrapper.type = 107;

        this.sendData(wrapper);
    },
    
    	addOrReplaceClosure: function(type, context, callBack) {
        	if (typeof this.callBackMaps[type] == 'undefined')
            		this.callBackMaps[type] = new Array();
            
        	var funcName = com.snapstick.api.game.common.callInClosure(context).callMethod(callBack);
        	for (var i=0; i < this.callBackMaps[type].length; i++) {
            		var eachClosure = this.callBackMaps[type][i];
            		if ((eachClosure.devContext == context) && (eachClosure.devCallback == callBack)) {
				window.removeEventListener(type, eachClosure.devClosure, false);
                		eachClosure.devClosure = funcName;
                		return funcName;
            		}
        	}
        	var closureMap = {devContext: context, devCallback: callBack, devClosure: funcName};
        	this.callBackMaps[type].push(closureMap);
        	return funcName;        
    	},
    
    	removeClosure: function(type, context, callBack) {
        	if (typeof this.callBackMaps[type] == 'undefined')
            		return null;
            
        	for (var i=0; i < this.callBackMaps[type].length; i++) {
            		var eachClosure = this.callBackMaps[type][i];
            		if ((eachClosure.devContext == context) && (eachClosure.devCallback == callBack)) {
                		var funcName = eachClosure.devClosure;
                		this.callBackMaps[type].splice(i, 1);
                		return funcName;
            		}
        	}
        	return null;
    	},

	registerForClientConnect: function(context, callBackForClientConnect){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.CLIENT_CONNECT_EVENT, context, callBackForClientConnect);
		window.addEventListener(com.snapstick.api.game.common.CLIENT_CONNECT_EVENT, closureName, false);
	},
	
	unRegisterForClientConnect: function(context, callBackForClientConnect){
		var closureName = this.removeClosure(com.snapstick.api.game.common.CLIENT_CONNECT_EVENT, context, callBackForClientConnect);
		if (closureName != null)	
			window.removeEventListener(com.snapstick.api.game.common.CLIENT_CONNECT_EVENT, closureName, false);
	},
	
	registerForGameStart: function(context, callBackForGameStart){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.GAME_CONTROL_START_EVENT, context, callBackForGameStart);
		window.addEventListener(com.snapstick.api.game.common.GAME_CONTROL_START_EVENT, closureName, false);
	},
	
	unRegisterForGameStart: function(context, callBackForGameStart){
		var closureName = this.removeClosure(com.snapstick.api.game.common.GAME_CONTROL_START_EVENT, context, callBackForGameStart);
		if (closureName != null)
			window.removeEventListener(com.snapstick.api.game.common.GAME_CONTROL_START_EVENT, closureName, false);
	},
	
	registerForGameRestart: function(context, callBackForGameRestart){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.GAME_CONTROL_START_EVENT, context, callBackForGameRestart);
		window.addEventListener(com.snapstick.api.game.common.GAME_CONTROL_RESTART_EVENT, closureName, false);
	},
	
	unRegisterForGameRestart: function(context, callBackForGameRestart){
		var closureName = this.removeClosure(com.snapstick.api.game.common.GAME_CONTROL_RESTART_EVENT, context, callBackForGameRestart);
		if (closureName != null)	
			window.removeEventListener(com.snapstick.api.game.common.GAME_CONTROL_RESTART_EVENT, closureName, false);
	},

	registerForGameEnd: function(context, callBackForGameEnd){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.GAME_CONTROL_END_EVENT, context, callBackForGameEnd);
		window.addEventListener(com.snapstick.api.game.common.GAME_CONTROL_END_EVENT, closureName, false);
	},
	
	unRegisterForGameEnd: function(context, callBackForGameEnd){
		var closureName = this.removeClosure(com.snapstick.api.game.common.GAME_CONTROL_END_EVENT, context, callBackForGameEnd);
		if (closureName != null)
			window.removeEventListener(com.snapstick.api.game.common.GAME_CONTROL_END_EVENT, closureName, false);
	},
	
	registerForClientDisconnect: function(context, callBackForClientDisconnect){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.CLIENT_DISCONNECT_EVENT, context, callBackForClientDisconnect);
		window.addEventListener(com.snapstick.api.game.common.CLIENT_DISCONNECT_EVENT, closureName, false);
	},
	
	unRegisterForClientDisconnect: function(context, callBackForClientDisconnect){
		var closureName = this.removeClosure(com.snapstick.api.game.common.CLIENT_DISCONNECT_EVENT, context, callBackForClientDisconnect);
		if (closureName != null)
			window.removeEventListener(com.snapstick.api.game.common.CLIENT_DISCONNECT_EVENT, closureName, false);
	},
	
	registerForCustomMessage: function(context, customMessageEventCallback){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.CUSTOM_MESSAGE_EVENT, context, customMessageEventCallback);
		window.addEventListener(com.snapstick.api.game.common.CUSTOM_MESSAGE_EVENT, closureName, false);
	},
	
	unRegisterForCustomMessage: function(context, customMessageEventCallback){
		var closureName = this.removeClosure(com.snapstick.api.game.common.CUSTOM_MESSAGE_EVENT, context, customMessageEventCallback);
		if (closureName != null)
			window.removeEventListener(com.snapstick.api.game.common.CUSTOM_MESSAGE_EVENT, closureName, false);
	},

	registerForClientListMessage: function(context, clientListEventCallback){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.CLIENT_LIST_EVENT, context, clientListEventCallback);
		window.addEventListener(com.snapstick.api.game.common.CLIENT_LIST_EVENT, closureName, false);
	},
	
	unRegisterForClientListMessage: function(context, clientListEventCallback){
		var closureName = this.removeClosure(com.snapstick.api.game.common.CLIENT_LIST_EVENT, context, clientListEventCallback);
		window.removeEventListener(com.snapstick.api.game.common.CLIENT_LIST_EVENT, closureName, false);
	},

    registerForScreenChangeEvent: function(context, screenChangedCallback){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.SCREEN_CHANGED_EVENT, context, screenChangedCallback); 
		window.addEventListener(com.snapstick.api.game.common.SCREEN_CHANGED_EVENT, closureName, false);
	},
	
	unRegisterForScreenChangeEvent: function(context, screenChangedCallback){
		var closureName = this.removeClosure(com.snapstick.api.game.common.SCREEN_CHANGED_EVENT, context, screenChangedCallback);
		if (closureName != null)
			window.removeEventListener(com.snapstick.api.game.common.SCREEN_CHANGED_EVENT, closureName, false);
	},	
    registerForDSCodeChange: function(context, screenChangedCallback){
		var closureName = this.addOrReplaceClosure(com.snapstick.api.game.common.DS_CODE_CHANGED_EVENT, context, screenChangedCallback); 
		window.addEventListener(com.snapstick.api.game.common.DS_CODE_CHANGED_EVENT, closureName, false);
	},
	
	unRegisterForDSCodeChange: function(context, screenChangedCallback){
		var closureName = this.removeClosure(com.snapstick.api.game.common.DS_CODE_CHANGED_EVENT, context, screenChangedCallback);
		if (closureName != null)
			window.removeEventListener(com.snapstick.api.game.common.DS_CODE_CHANGED_EVENT, closureName, false);
    }
};

com.snapstick.api.game.server.Queue.prototype = {
	length: 0,
	max_num_players: 2,
	max_length:70,
	first: null,
	last: null,
	clientIdNodeMap: {},
};

com.snapstick.api.game.server.Queue.Node = function(clientId, data) {
	this.prev = null; 
	this.next = null;
	this.clientId = clientId;
	this.data = data;
	this.status = 'CONNECTED';
	this.inGame = false;
	this.isMidGame = false;
};

com.snapstick.api.game.server.Queue.prototype.appendAtEnd = function (node){
	if (this.first === null) {
		this.first = node;
	} else {
		if(this.last === null) {
			this.last = node;
			this.last.prev = this.first;
			this.first.next = node;
		} else {
			node.prev = this.last;
			this.last.next = node;
			this.last = node;
			this.last.next = null;
		}
	}
  	this.length++;
  	this.clientIdNodeMap[node.clientId]=node;
};

com.snapstick.api.game.server.Queue.prototype.remove = function(node) {
	if (this.length > 1) {
		if(node.prev != null) node.prev.next = node.next;
		if(node.next != null) node.next.prev = node.prev;
		if (node == this.first) { 
			this.first = node.next; 
			if(this.first == this.last) {this.last = null;}
		}
		if (node == this.last) { 
			this.last = node.prev;
			if(this.first == this.last) {this.last = null;}
		}
	} else {
		this.first = null;
		this.last = null;
	}
	node.prev = null;
	node.next = null;
	this.length--;
  	delete this.clientIdNodeMap[node.clientId];
};

com.snapstick.api.game.server.Queue.prototype.exists = function(clientId) {
  	if (typeof this.clientIdNodeMap[clientId] == "undefined" || this.clientIdNodeMap[clientId] == null || this.clientIdNodeMap[clientId] == "undefined")
  		return false;
  	return true;
};

com.snapstick.api.game.server.Queue.prototype.getNodeByClientId = function(clientId) {
  	return this.clientIdNodeMap[clientId];
};

com.snapstick.api.game.server.Queue.prototype.push = function(clientId, data) {
  	if (this.exists(clientId)) {
  		this.clientIdNodeMap[clientId].status='CONNECTED';
  		return this.clientIdNodeMap[clientId];
  	}
  	else {
  		if (this.length >= this.max_length) {
  			return null;
  		}
  		var node = new com.snapstick.api.game.server.Queue.Node(clientId, data)
  		this.appendAtEnd(node);
  		return node;
  	}
};

com.snapstick.api.game.server.Queue.prototype.popFront = function() {
	var node = this.first;
	if (typeof node != "undefined" && node != null) {
		this.remove(node);
  	}
	return node;
};

com.snapstick.api.game.server.Queue.prototype.front = function() {
	return this.first;
};

com.snapstick.api.game.server.Queue.prototype.getNextWaiting = function() {
	var node = this.first;
	while(node != null) {
		if (node.status == "DISCONNECTED") {
			var tmp = node.next;
			this.remove(node);
			node = tmp;
		}
		else if (node.inGame == true) {
			node = node.next;
		}
		else
			break;
	}
	return node;
};

com.snapstick.api.game.server.Queue.prototype.resetMidGame = function() {
	var node = this.first;
	while(node != null) {
		if (node.inGame || node.isMidGame == true) {
			node.isMidGame = false;
			node = node.next;
		}
		else
			break;
	}
};

com.snapstick.api.game.server.Queue.prototype.raiseQueueUpdateEvent = function() {
	var topTen = [];
	var count = 0;
	var node = this.first;
	var inGameCount=0;
	while(node != null) {
		if(node.inGame) {
			node = node.next;
			inGameCount++;
		}
		else {
			var d = {};
			d.data = node.data;
			d.clientId = node.clientId;
			d.status = node.status;
			d.inGame = node.inGame;
			d.isMidGame = node.isMidGame;
			topTen.push(d);
			count++;
			node = node.next;
		}
		if (count >= 10)
			break;
	}
	var node = this.first;
	var count = 0;
	while(node != null) {
		var data = {};
		data.inGame = node.inGame;
		var d = {};
		d.data = node.data;
		d.clientId = node.clientId;
		d.status = node.status;
		d.inGame = node.inGame;
		d.isMidGame = node.isMidGame;
		data.self = d;
		data.totalInQueue = this.length - inGameCount;
		data.maxNumPlayers = this.max_num_players;
        
		console.log('Sending update to ' + node.clientId);
		if(node.inGame == false) {
			//Populate the required data here and send the message.
			data.topTen = topTen;
			data.selfPosition = count;
			count++;
		}
		var wrapper = {};
		wrapper.type = com.snapstick.api.game.common.GAME_CONTROL_MESSAGE_EVENT;
		wrapper.name = com.snapstick.api.game.common.GAME_CONTROL_QUEUE_EVENT;
		wrapper.payload = data;        
		com.snapstick.api.game.server.sendDataToController(node.clientId, wrapper);
		node = node.next;
	}
	
};

com.snapstick.api.game.server.Queue.prototype.serializeQueue = function() {
	//This function JSON friendly array from queue.
	var players = [];
	var count = 0;
	var node = this.first;
	var inGameCount=0;
	while(node != null) {
		if(node.inGame) {
			inGameCount++;
		}
		var d = {};
		d.data = node.data;
		d.clientId = node.clientId;
		d.status = node.status;
		d.inGame = node.inGame;
		d.isMidGame = node.isMidGame;
		players.push(d);
		count++;
		node = node.next;
	}
	return players;
};

com.snapstick.api.game.server.Queue.prototype.toString = function() {
	var string = "{";
	var tmp = this.first;
	while(tmp != null)
	{
		string += ": " + tmp.x +" " + tmp.y;
		tmp = tmp.next;
	}
	string += "}";
	return string;
};

