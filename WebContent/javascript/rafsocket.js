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

	var rafWsUri = 'ws://localhost:1337/'; // TODO: make this be a config variable
	var provision_blob = 'd636db3c-adcb-4e5a-b269-658a6546b01f16_38_0000'; // TODO: make this be a config variable
	var isOpen = false;
	var lastMessageID = 1;
	var sentMessages = [];
	var socket = null;
	var refCnt = 0;
	var listeners = [];

	// Private methods
	///////////////////////////////////////////////////////////////////////////////////////////////

	function send(message, callback, context) {

		var messageRecord = {
			id : lastMessageID,
			message : '<system_request system_msg_id="' + lastMessageID + '">' + message + '</system_request>',
			callback : callback,
			queued : !isOpen,
			context : context
		};

		lastMessageID++;

		sentMessages[messageRecord.id] = messageRecord;

		if (null == socket) {
			socket = getWebSocket(rafWsUri);
			socket.onopen = onSocketOpen;
			socket.onclose = onSocketClose;
			socket.onmessage = onIncomingMessage;
			socket.onerror = onSocketError;
		} else if (isOpen) {
			socket.send(messageRecord.message);
		}

	}

	function sendRmfRequest(message, callback, context) {
		send('<rmf_request>' + message + '</rmf_request>', callback, context);
	}
	
	function sendRegistrationRequest(message, callback, context) {
		send('<registration_request>' + message + '</registration_request>', callback, context);
	}
	
	function sendHTTPGetRequest(message, callback, context) 
        {
		send('<http_request http_verb="GET" url="' + message + '"/>', callback, context);
	}

	function onSocketOpen(evt) {
		isOpen = true;
		for ( var id in sentMessages) {
			var messageRecord = sentMessages[id];
			if (messageRecord.queued) {
				socket.send(messageRecord.message);
				messageRecord.queued = false;
			}
		}
	}

	function onSocketClose(evt) {
		isOpen = false;
	}

	function onSocketError(evt) {
		var index;
		for(index = 0; index < listeners.length; index++ )
		{
			listeners[index].listener("SocketError", listeners[index].context);
		}
	}

	function onIncomingMessage(evt) {
		var xml = (new window.DOMParser()).parseFromString(evt.data, 'text/xml');
		var response = new RafResponse(xml.firstChild);
		var id = response.getMsgID();
		showStatus("MessageID:" + id);
		if (id == '') {
			// Unsolicited RAF messages land here
			// Send response to whoever is listening
			var index;
			for(index = 0; index < listeners.length; index++ )
			{
				listeners[index].listener(response.getResponse(), listeners[index].context);
			}
			
		} else {
			// Would be nice to send a request-specific object instead of the raw XML
			if (sentMessages[id] && (typeof sentMessages[id].callback == 'function')) {
				sentMessages[id].callback(response.getResponse(), sentMessages[id].context);
			}

			// StackOverflow says this is how to delete from associative array in JS..
			delete sentMessages[id];
		}
	}

	return new function() {

		// Public member variables
		///////////////////////////////////////////////////////////////////////////////////////////////
		
		// this.whatever = 'hi';

		// Public methods
		///////////////////////////////////////////////////////////////////////////////////////////////
		this.getInstance = function() {
			refCnt++;
			return this;
		};

		this.releaseInstance = function() {
			if (null == socket)
				return;
			refCnt--;
			if (0 == refCnt) {
				//clean listener
				var numOfListeners = listeners.length;
				listeners.splice(0, numOfListeners);
				
				//clean socket
				socket.close();
				delete socket;
				socket = null;
			}
		};

		this.addListener = function(listener, context) {
			listeners.push({listener:listener, context:context});
		};
		
		this.removeListener = function(listener) {
			var index = 0;
			for(index = 0; index < listeners.length; index++)
			{
				if(listeners[index].listener == listener)
				{
					listeners.splice(index, 1);
					break;
				}
			}
		};
		
		this.rmfInit = function(callback, context) {
			sendRmfRequest('<init target_player="dsas" />', callback, context);
		};

        this.rmfSetParams = function(callback, context) {
            sendRmfRequest('<set_params><param key=provision_blob>' + provision_blob + '</param><param key=country_code>US</param><param key=language_code>en</param></set_params>', callback, context);
        };

		this.rmfOpen = function(url, callback, context) {
			sendRmfRequest('<open url="' + url + '" />', callback, context);
		};
      
		this.rmfPlay = function(speed, position, callback, context) {

			// dps_player requires playback_position even if it is 0
			if (position == undefined) position = 0;
			var request = '<play play_rate="' + speed + '" playback_position="' + position + '"/>';

			sendRmfRequest(request, callback, context);
		};

		this.rmfPause = function(callback, context) {
			sendRmfRequest('<pause/>', callback, context);
		};

		this.rmfStop = function(callback, context) {
			sendRmfRequest('<stop/>', callback, context);
		};

		this.rmfSwitchAudio = function(track_id, callback, context) {
			sendRmfRequest('<select_audio_track audio_track_id="' + track_id + '"/>', callback, context);
		};

		this.rmfSwitchSubtitle = function(track_id, callback, context) {
			sendRmfRequest('<select_subtitle_track subtitle_track_id="' + track_id + '"/>', callback, context);
		};

		this.rmfGetAudioStreamList = function(callback, context) {
			sendRmfRequest('<get_audio_stream_list/>', callback, context);
		};

		this.rmfGetSubtitleStreamList = function(callback, context) {
			sendRmfRequest('<get_subtitle_stream_list/>', callback, context);
		};

		this.rmfInitRegistration = function(callback, context) { 
			sendRegistrationRequest('<init provision_blob=' + provision_blob + ' country_code=\'US\' language_code=\'en\'/>', callback, context);
		};
		
		this.rmfGetDmd = function(callback, context) {
			sendRegistrationRequest('<get_dmd_hash/>', callback, context);
		};
		
		this.rmfGetDcfValues = function(callback, context) { 
			sendRegistrationRequest('<get_dcf_product_values/>', callback, context);
		};

		this.rmfCloseRegistration = function(callback, context) { 
			sendRegistrationRequest('<close/>', callback, context);
		};

		this.rmfGetStoreFrontInfo = function(callback, context) {
			sendRegistrationRequest('<get_store_front_info/>', callback, context);
		};

		this.rmfSendHTTPGetRequest = function( URL, callback, context ) 
                {
                    sendHTTPGetRequest( URL, callback, context );
		};
                  
	}; // End of return

})(); // End of rafsocket

/* RAF system response */
function RafResponse(node) {
	var xmlNode = node;
	var msgID = (xmlNode) ? xmlNode.attributes[0].value : '';

	//Private methods
	function isError() {
		return (xmlNode.firstChild.nodeName == 'error_response');
	}
	
	//Public methods
	this.getMsgID = function() {
		return msgID;
	};
	
	this.getResponse = function() {
		try{
			if(isError())
				return (new RafErrorResponse(xmlNode.firstChild));
			else
				return (new RafSuccessResponse(xmlNode.firstChild));
		} catch(e) {
			return null;	
		}
	};
}

/* RAF error response */
function RafErrorResponse(node) {
	
	var xmlNode = node;
	var error_code = (xmlNode) ? xmlNode.attributes.error_code.value : '';
	var error_type = (xmlNode) ? xmlNode.attributes.error_type.value : '';
	var message = (xmlNode) ? xmlNode.firstChild.textContent : '';
	
	// Public methods
	this.getErrorCode = function() {
		return error_code;
	};
	
	this.getErrorType = function() {
		return error_type;
	};

	this.getErrorMessage = function() {
		return message;
	};
}

/* RAF success response */
function RafSuccessResponse(node) {
	
	var xmlNode = node.firstChild;
	
	//Public methods
	this.getType = function() {
		return xmlNode.nodeName;
	};
	
	this.getMsgNode = function() {
		return xmlNode.firstChild;
	};
}
