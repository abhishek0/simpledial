/**
 * RAF socket wrapper
 * 
 * @classDescription rafsocket is a singleton class, call
 *                   rafsocket.getInstance() to get the instance and
 *                   releaseInstance() to release when done with the instance.
 *                   WebSocket is opened when getInstance() is called in the
 *                   first time, it is closed when releaseInstance() is called
 *                   and no one uses it. JavaScript throws exception on the call
 *                   like "new rafsocket()".
 */

var rafsocket = (function() {

	// Private member variables
	///////////////////////////////////////////////////////////////////////////////////////////////
	var action;

	// Private methods
	///////////////////////////////////////////////////////////////////////////////////////////////

	function send(message, callback, context) {


	}

	function sendRmfRequest(message, callback, context) {
	}

	function onSocketOpen(evt) {
	}

	function onSocketClose(evt) {
	}

	function onSocketError(evt) {
	}

	function onIncomingMessage(evt) {
	}

	function appendAction(newAction) {
		action += newAction + "|";
	}
	
	function privateGetAction() {
		return action;
	}

	function privateClearAction() {
		action = "|";
	}
	
	return new function() {

		// Public member variables
		///////////////////////////////////////////////////////////////////////////////////////////////
		
		// this.whatever = 'hi';

		
		// Public methods
		///////////////////////////////////////////////////////////////////////////////////////////////
		this.getInstance = function() {
			appendAction("getInstance");
			return this;
		};

		this.releaseInstance = function() {
			appendAction("releaseInstance");
		};

		this.addListener = function(listener, context) {
			appendAction("addListener");
		};
		
		this.removeListener = function(listener) {
			appendAction("removeListener");
		};
		
		this.rmfInit = function(callback, context) {
			appendAction("rmfInit");
			callback(new RafSuccessResponse());
		};

		this.rmfOpen = function(url, callback, context) {
			appendAction("rmfOpen [url: " + url + "]");
			callback(new RafSuccessResponse());
		};

		this.rmfPlay = function(speed, position, callback, context) {
			appendAction("rmfPlay [speed: " + speed + " " + "pos: " + position + "]");
			callback(new RafSuccessResponse());
		};

		this.rmfPause = function(callback, context) {
			appendAction("rmfPause");
            callback(new RafSuccessResponse());
		};

		this.rmfStop = function(callback, context) {
			appendAction("rmfStop");
			callback(new RafSuccessResponse());
		};

		this.rmfSwitchAudio = function(callback, context) {
			appendAction("rmfSwitchAudio");
		};

		this.rmfSwitchSubtitle = function(callback, context) {
			appendAction("rmfSwitchSubtitle");
		};

		this.rmfGetAudioTrack = function(callback, context) {
			appendAction("rmfGetAudioTrack");
		};

		this.rmfGetSubtitleTrack = function(callback, context) {
			appendAction("rmfGetSubtitleTrack");
		};
		
		this.rmfGetAudioStreamList = function(callback, context) {
			appendAction("rmfGetAudioStreamList", callback, context);
		};

		this.rmfGetSubtitleStreamList = function(callback, context) {
			appendAction("rmfGetSubtitleStreamList", callback, context);
		};
		
		this.getAction = function() {
			return privateGetAction();
		};
		
		this.clearAction = function() {
			return privateClearAction();
		};
		
	}; // End of return

})(); // End of rafsocket

/* RAF system response */
function RafResponse(node) {


	//Private methods
	function isError() {
		return false;
	}
	
	//Public methods
	this.getMsgID = function() {
		return null;
	};
	
	this.getResponse = function() {
		return null;
	};
}

/* RAF error response */
function RafErrorResponse() {
	
	// Public methods
	this.getErrorCode = function() {
		return null;
	};
	
	this.getErrorType = function() {
		return null;
	};

	this.getErrorMessage = function() {
		return null;
	};
}

/* RAF success response */
function RafSuccessResponse() {
	
	
	//Public methods
	this.getType = function() {
		return null;
	};
	
	this.getMsgNode = function() {
		return null;
	};
}
