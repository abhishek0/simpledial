var webSocketInstance;

function logStatus(message) {
	window.external.user("JS-DEBUG: " + message);
}

var WebSocketExternal = (function() {
	
	var isOpen = false;

	return new function() {
		this.getInstance = function() {
			if(webSocketInstance == null) {
				webSocketInstance = this;		
				window.external.user("WEB_SOCKET:OPEN");
			}
			return webSocketInstance;
		};


		this.send = function(message) {
			window.external.user("WEB_SOCKET:SEND" + message);
		};

		this.close = function() {
			window.external.user("WEB_SOCKET:CLOSE");
		};

		this.data = function(message) {
			var evt = new Object();
						
			evt.data = message;
			this.onmessage(evt);
		};

		this.open = function() {
			var evt = new Object();
			this.onopen(evt);
		};

		
	}; // End of return

})();

var socketOpenTimer;
function externalMessage(message) {
try {
	logStatus(message);
	var dta = "";
	var i;
	for(i=0; i<message.length; i++) {
		var myChar = message.charAt(i);
		dta += myChar;
	}
	dta = dta.replace(/~1/g,'&');
	dta = dta.replace(/~2/g, "'");
	dta = dta.replace(/~3/g, '"');
	dta = dta.replace(/~4/g, "\\");
	dta = dta.replace("<http_response>", "<http_response><![CDATA[");
	dta = dta.replace("</http_response>", "]]></http_response>");
	logStatus(dta);
	if(dta === "OPEN") {
		socketOpenTimer = setInterval(function() {
			clearInterval(socketOpenTimer);
			try {
				webSocketInstance.open();
			}
			catch(e) {
			}
		}, 1000);
	}
	else {
		webSocketInstance.data(dta);
	}
}
catch (e) {
	logStatus("externalMessage FAIL: " + e.message);
}

}
