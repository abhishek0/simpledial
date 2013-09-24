function getWebSocket(uri) {
	return new MockWebSocket(uri);	
}


RafsocketTest = TestCase("RafsocketTest");	
RafsocketTest.prototype.testRafsocket = function() {
	var actions = "|";

	function appendAction (newAction) {
		actions += newAction + "|";
	}
	
	function doSuccessResponse(msgId) {
		var obj = new Object();
		if(msgId == null) {
			obj.data = "<system_response system_msg_id=''><success_response><rmf_response></rmf_response></success_response></system_response>";
		}
		else {
			obj.data = "<system_response system_msg_id='" + msgId + "'><success_response><rmf_response></rmf_response></success_response></system_response>";
		}
		mockWebSocket.onmessage(obj);
	}
		
	var raf = rafsocket.getInstance();
	assertNotNull(raf);
	
	raf.rmfInit(function(response) {
		appendAction("Got init response...");
		assertTrue(response instanceof RafSuccessResponse);
	});
	mockWebSocket.onopen(null);
	doSuccessResponse("1");

	raf.rmfOpen("myurl", function(response) {
		appendAction("Got open response...");
		assertTrue(response instanceof RafSuccessResponse);
	});
	doSuccessResponse("2");

	raf.rmfPlay(1, 0, function(response) {
		appendAction("Got play response...");
		assertTrue(response instanceof RafSuccessResponse);
	});
	doSuccessResponse("3");

	raf.rmfStop(function(response) {
		appendAction("Got stop response...");
		assertTrue(response instanceof RafSuccessResponse);
	});
	doSuccessResponse("4");
	
	raf.addListener(function(response) {
		appendAction("Got unsolicited response...");
		assertTrue(response instanceof RafSuccessResponse);
	});
	doSuccessResponse(null);

	assertEquals("|send(<system_request system_msg_id=\"1\"><rmf_request><init target_player=\"dsas\" /></rmf_request></system_request>)|send(<system_request system_msg_id=\"2\"><rmf_request><open url=\"myurl\" /></rmf_request></system_request>)|send(<system_request system_msg_id=\"3\"><rmf_request><play play_rate=\"1\" playback_position=\"0\"/></rmf_request></system_request>)|send(<system_request system_msg_id=\"4\"><rmf_request><stop/></rmf_request></system_request>)|", mockWebSocket.getAction());
	assertEquals("|Got init response...|Got open response...|Got play response...|Got stop response...|Got unsolicited response...|", actions);		
};


SuccessResponseTest = TestCase("SuccessResponseTest");	
SuccessResponseTest.prototype.testSuccessResponse = function() {
	
	var xml = (new window.DOMParser()).parseFromString("<system_response system_msg_id='27'><success_response><rmf_response></rmf_response></success_response></system_response>", 'text/xml');
	var response = new RafSuccessResponse(xml.firstChild);
	assertEquals("success_response", response.getType());
	assertEquals("<rmf_response/>", (new XMLSerializer()).serializeToString(response.getMsgNode()));
};

// The code we got from Randor for Error Response was wrong.  Let's enable this unit test after we fix the code 
//ErrorResponseTest = TestCase("ErrorResponseTest");	
//ErrorResponseTest.prototype.testErrorResponse = function() {
//	
//	var xml = (new window.DOMParser()).parseFromString("<system_response system_msg_id='27' error_code='myErrorCode' error_type='myErrorType'><error_response ><message>My error message</message></error_response></system_response>", 'text/xml');
//	var response = new RafErrorResponse(xml.firstChild);
//	assertEquals("myErrorType", response.getErrorType());
//	assertEquals("myErrorCode", response.getErrorCode());
//	assertEquals("My error message", response.getErrorMessage());		
//};
