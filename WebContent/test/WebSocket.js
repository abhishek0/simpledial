var mockWebSocket;

function MockWebSocket(url) {
	var action = "|";
	
	mockWebSocket = this;
	
	this.send = function (msg) {
		appendAction("send(" + msg + ")");
	};
	
	this.close = function() {
	};
	
	function appendAction (newAction) {
		action += newAction + "|";
	}
	
	this.getAction = function() {
		return action;
	};

	this.clearAction = function() {
		action = "|";
	};
	
}
