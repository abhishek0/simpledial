var contentUrl = "http://myserver/mycontent.smil";


PlayTest = TestCase("OpenPlayTest");	
PlayTest.prototype.testDoPlay = function() {
	rafsocket.clearAction();
	raf = null;
	doStart();
	doStop();
	jstestdriver.console.log(rafsocket.getAction());
	assertEquals("|getInstance|addListener|addListener|rmfInit|rmfOpen [url: http://myserver/mycontent.smil]|rmfGetSubtitleStreamList|rmfGetAudioStreamList|rmfPlay [speed: 1 pos: 0]|rmfStop|", rafsocket.getAction());
};

PauseTest = TestCase("PauseTest");	
PauseTest.prototype.testDoPause = function() {
	rafsocket.clearAction();
	raf = null;
	doStart();
    doPause();
	jstestdriver.console.log(rafsocket.getAction());
	assertEquals("|getInstance|addListener|addListener|rmfInit|rmfOpen [url: http://myserver/mycontent.smil]|rmfGetSubtitleStreamList|rmfGetAudioStreamList|rmfPlay [speed: 1 pos: 0]|rmfPause|", rafsocket.getAction());
};

