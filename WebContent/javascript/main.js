var raf = null;
var focusButton = null;
var trickRates = [ 2, 4, 8, 16, 32 ];
var speedIndex = 0;

var STATE_OPENING = "STATE_OPENING";
var STATE_CLOSED = "STATE_CLOSED";
var STATE_PLAYING = "STATE_PLAYING";
var STATE_FF = "STATE_FF";
var STATE_REWIND = "STATE_REWIND";
var STATE_PAUSED = "STATE_PAUSED";
var state;

var audioCount = 0;
var subtitleCount = 0;

var play_position = 0;
var play_rate = 0;
var dps_play_state = 0;
var playback_level = 0;
var playback_bitrate = 0;
var download_progress = 0;
var display_play_time = "";

var audio_streams = [];
var subtitle_streams = [];
var selected_audio_stream = 0;
var selected_subtitle_stream = -1;

Manager = {
	processMessage: function(event) {
		switch (event.data.message)
		{
			case "start":
				doStop();
				console.log('video url ' + event.data.url);
				contentUrl = event.data.url;
				doStart();
				break;
			case "play":
				if (state == STATE_CLOSED) {
					doStart();
				} else {
					doPlay();
				}
				break;
			case "pause":
				if (state == STATE_PAUSED) {
					doPlay();
				} else if (state == STATE_PLAYING) {
					doPause();
				}
				break;
			case "stop":
				doStop();
				break;
		}	
	}
};

function onBodyLoad() {
	com.snapstick.api.game.server.init();
	com.snapstick.api.game.server.registerForCustomMessage(Manager, Manager.processMessage);

	var element = document.getElementById("revision");
	displayRevision(element, revision);
	showPlayerStatus("Stopped");
	setState(STATE_CLOSED);
	setFocus("playButton");

	// Keydown event setup methods depends on the capabilities of the browser
	if(window.addEventListener) {
		document.addEventListener("keydown", keyDown, false);
	}
	else {
		document.attachEvent("onkeydown", keyDown);
	}
}

function setState(newState) {
	var button = document.getElementById("playButton");
	if(button == null)
		return;
	
	state = newState;
	if (state == STATE_CLOSED) {
		setEnabled("stopButton", false);
		setEnabled("pauseButton", false);
		setEnabled("playButton", true);
		setEnabled("rwButton", false);
		setEnabled("ffButton", false);
		setEnabled("subtitleButton", false);
		setEnabled("audioButton", false);
		setEnabled("dmdButton", true);
		//setEnabled("storefrontinfoButton", true);
		setEnabled("productDescButton", true);
	} else if (state == STATE_FF || state == STATE_REWIND) {
		setEnabled("stopButton", true);
		setEnabled("pauseButton", false);
		setEnabled("playButton", true);
		setEnabled("rwButton", true);
		setEnabled("ffButton", true);
		setEnabled("subtitleButton", false);
		setEnabled("audioButton", false);
		setEnabled("dmdButton", true);
		//setEnabled("storefrontinfoButton", true);
		setEnabled("productDescButton", true);
	} else if (state == STATE_PLAYING) {
		setEnabled("stopButton", true);
		setEnabled("pauseButton", true);
		setEnabled("playButton", true);
		setEnabled("rwButton", true);
		setEnabled("ffButton", true);
		setEnabled("subtitleButton", true);
		setEnabled("audioButton", true);
		setEnabled("dmdButton", true);
		//setEnabled("storefrontinfoButton", true);
		setEnabled("productDescButton", true);
	} else if (state == STATE_OPENING) {
		setEnabled("stopButton", true);
		setEnabled("pauseButton", false);
		setEnabled("playButton", false);
		setEnabled("rwButton", false);
		setEnabled("ffButton", false);
		setEnabled("subtitleButton", false);
		setEnabled("audioButton", false);
		setEnabled("dmdButton", false);
		//setEnabled("storefrontinfoButton", false);
		setEnabled("productDescButton", false);
		setFocus("stopButton");
	} else {
		setEnabled("stopButton", true);
		setEnabled("pauseButton", true);
		setEnabled("playButton", true);
		setEnabled("rwButton", true);
		setEnabled("ffButton", true);
		setEnabled("subtitleButton", true);
		setEnabled("audioButton", true);
		setEnabled("dmdButton", true);
		//setEnabled("storefrontinfoButton", true);
		setEnabled("productDescButton", true);
	}
}

function getNextSibling(n, callback) {
	do {
		n = n.nextSibling;
	} while (n && (n.nodeType != 1 || !callback(n)));
	return n;
};

function getPreviousSibling(p, callback) {
	do
		p = p.previousSibling;
	while (p && (p.nodeType != 1 || !callback(p)));
	return p;
};

function getWebSocket(uri) {
	var sock;
	try {
		sock = new WebSocket(uri);
	}
	catch (e) {
		try {
			sock = WebSocketExternal.getInstance();
		}
		catch (e2) {
		}
	}
	return sock;
}

function displayRevision(node, revision) {
	var tag = document.createElement("span");
	tag.innerHTML = "Revision: " + revision;
	node.appendChild(tag);
}

function getKeypress(e) {
	return (typeof e == 'undefined') ? window.event.keyCode : e.keyCode;
}

function setFocus(newFocus) {
	var elementClass;
	if (focusButton != null) {
		elementClass = document.getElementById(focusButton).className;
		if(elementClass == null) {
			elementClass = "";
		}
		elementClass = elementClass.replace(" buttonfocus", "");
		document.getElementById(focusButton).className = elementClass;
	}
	focusButton = newFocus;

	var element = document.getElementById(focusButton);
	if(element != null){
		elementClass = element.className;
		if(elementClass == null) {
			elementClass = "";
		}
		element.className =
				elementClass + " buttonfocus";	
	}
}

function setEnabled(elementName, enabled) {
	var elementClass;
	elementClass = document.getElementById(elementName).className;
	if(elementClass == null) {
		elementClass = "";
	}
	try {
		elementClass = elementClass.replace(" buttondisabled", "");
	}
	catch (e) {
	}
	if (!enabled) {
		elementClass += " buttondisabled";
	}

	document.getElementById(elementName).className = elementClass;
}

function isEnabled(element) {
	return element.className.indexOf("buttondisabled") < 0;
}

function navPrevious() {
	var obj = getPreviousSibling(document.getElementById(focusButton),
			isEnabled);
	if (obj != null) {
		setFocus(obj.getAttributeNode("id").nodeValue);
	}
}

function navNext() {
	var obj = getNextSibling(document.getElementById(focusButton), isEnabled);

	if (obj != null) {
		setFocus(obj.getAttributeNode("id").nodeValue);
	}
}

function keyDown(e) {
	showStatus(getKeypress(e));

	switch (focusButton) {
	case "rwButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			if (state != STATE_CLOSED) {
				if (state == STATE_REWIND) {
					speedIndex++;
					if (speedIndex >= trickRates.length) {
						speedIndex = trickRates.length - 1;
					}
				} else {
					speedIndex = 0;
					setState(STATE_REWIND);
				}
				doTrick(0 - trickRates[speedIndex]); // negative for reverse
			}
			break;
		}
		break;
	case "playButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			if (state == STATE_CLOSED) {
				doStart();
			} else {
				doPlay();
			}
			break;
		}
		break;
	case "pauseButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			if (state == STATE_PAUSED) {
				doPlay();
			} else if (state == STATE_PLAYING) {
				doPause();
			}
			break;
		}
		break;
	case "stopButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			doStop();
			break;
		}

		break;
	case "ffButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			if (state != STATE_CLOSED) {
				if (state == STATE_FF) {
					speedIndex++;
					if (speedIndex >= trickRates.length) {
						speedIndex = trickRates.length - 1;
					}
				} else {
					speedIndex = 0;
					setState(STATE_FF);
				}
				doTrick(trickRates[speedIndex]);
			}
			break;
		}
		break;
	case "audioButton":
		switch (getKeypress(e)) {
		case VK_DOWN:
			if (state != STATE_CLOSED) {
				showElement("audioMenu", true);
				setFocus("audioItem0");
			}
			break;
		case VK_LEFT:
		case VK_RIGHT:
			showElement("audioMenu", false);
			break;
		case VK_ENTER:
			if (state != STATE_CLOSED) {
				showElement("audioMenu", true);
			}
			break;
		}
		break;
	case "subtitleButton":
		switch (getKeypress(e)) {
		case VK_DOWN:
			if (state != STATE_CLOSED) {
				showElement("subtitleMenu", true);
				setFocus("subtitleItem-1");
			}
			break;
		case VK_LEFT:
		case VK_RIGHT:
			showElement("subtitleMenu", false);
			break;
		case VK_ENTER:
			if (state != STATE_CLOSED) {
				showElement("subtitleMenu", true);
			}
			break;
		}
		break;
	case "dmdButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			doDmd();
			break;
		}
		break;
	case "productDescButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			doDcfValues();
			break;
		}
		break;
      case "storefrontinfoButton":
		switch (getKeypress(e)) {
		case VK_ENTER:
			doStoreFrontInfo();
		        break;
		}
		break;
	default:
		if (focusButton.indexOf("subtitleItem") == 0) {
			var elementIndex = document.getElementById(focusButton)
					.getAttributeNode("index").nodeValue;
			switch (getKeypress(e)) {
			case VK_DOWN:
				elementIndex++;
				if (elementIndex >= subtitleCount) {
					elementIndex = -1;
				}
				setFocus("subtitleItem" + elementIndex);
				break;
			case VK_UP:
				elementIndex--;
				if (elementIndex < -1) {
					elementIndex = subtitleCount - 1;
				}
				setFocus("subtitleItem" + elementIndex);
				break;
			case VK_LEFT:
				showElement("subtitleMenu", false);
				setFocus("subtitleButton");
				break;
			case VK_RIGHT:
				showElement("subtitleMenu", false);
				setFocus("subtitleButton");
				break;
			case VK_ENTER:
				doSubtitle(elementIndex);
				showElement("subtitleMenu", false);
				setFocus("subtitleButton");
				break;
			}
		} else if (focusButton.indexOf("audioItem") == 0) {
			var elementIndex = document.getElementById(focusButton)
					.getAttributeNode("index").nodeValue;
			switch (getKeypress(e)) {
			case VK_DOWN:
				elementIndex++;
				if (elementIndex >= audioCount) {
					elementIndex = 0;
				}
				setFocus("audioItem" + elementIndex);
				break;
			case VK_UP:
				elementIndex--;
				if (elementIndex < 0) {
					elementIndex = audioCount - 1;
				}
				setFocus("audioItem" + elementIndex);
				break;
			case VK_LEFT:
				showElement("audioMenu", false);
				setFocus("audioButton");
				break;
			case VK_RIGHT:
				showElement("audioMenu", false);
				setFocus("audioButton");
				break;
			case VK_ENTER:
				doAudio(elementIndex);
				showElement("audioMenu", false);
				setFocus("audioButton");
				break;
			}
		}
		return;
		break;
	}
	switch (getKeypress(e)) {
	case VK_LEFT:
		navPrevious();
		break;
	case VK_RIGHT:
		navNext();
		break;
	}

}

function showElement(elementName, show) {
	var element = document.getElementById(elementName);
	style = element.getAttributeNode("style").nodeValue;
	if (show) {
		element.setAttribute("style", style.replace("display: none;",
				"display: block;"));
	} else {
		element.setAttribute("style", style.replace("display: block;",
				"display: none;"));
	}

}

function doStart() {
	setState(STATE_OPENING);
	if (raf == null) {
		raf = rafsocket.getInstance();
		raf.addListener(onGeneralRafError, null);
		raf.addListener(onRafResponse, null);

		// var plugin = document.getElementById("plugin");
		// showStatus("Plugin state: " + plugin.valid);
	}

	showPlayerStatus("Starting");
	showStepProgress("Opening...");

	raf.rmfInit(function(response) {
		if (response instanceof RafSuccessResponse) {
			showStatus("RAF Initialized");
            //Send DCF provisioning blob (contains AppID), country code, and language code that's used to localize error meesages from OVS and DCF
            raf.rmfSetParams(function(response) {
                if (response instanceof RafSuccessResponse) {
                    showStatus("Provisioning blob, country, language Sent");
                } else {
                    showStatus("RAF Failed to send Provisioning blob, country, language");
                }
            });

            raf.rmfOpen(contentUrl, function(response) {
                if(response instanceof RafSuccessResponse) {
                    showStatus("RAF Opened");
                    GetStreamDuration(response);
			showStepProgress("Downloading...");

                    // request available languages for audio and subtitles
                    raf.rmfGetSubtitleStreamList(function(response) {
                        if (response instanceof RafSuccessResponse) {
                            showStatus("RAF List of subtitles available");
                            // process the xml blob of subtitle streams into js
                            // objects. then stuff them
                            // into the subtitle_streams array.
                            GetSubtitleStreamList(response);
                        } else {
                            showStatus("RAF Failed to get list of subtitles");
                        }
                    });
                    raf.rmfGetAudioStreamList(function(response) {
                        if (response instanceof RafSuccessResponse) {
                            showStatus("RAF List of audio available");
                            // process the xml blob of subtitle streams into js
                            // objects. then stuff them
                            // into the subtitle_streams array.
                            GetAudioStreamList(response);
                        } else {
                            showStatus("RAF Failed to get list of audios");
                        }
                    });

			raf.rmfPlay(1, 0, function(response) {
                        if (response instanceof RafSuccessResponse) {
                            setState(STATE_PLAYING);
                            showAudioTrack((selected_audio_stream + 1) + ", " + audio_streams[selected_audio_stream].language);
                            showSubtitleTrack("none");
                            showStatus("RAF Playing");
                        } else {
                            showStatus("RAF Failed to Play");
                        }
                    });
                } else {
                    showStatus("RAF Failed to Open");
                }
            });
		} else {
			showStatus("RAF Failed to Initialize");
		}
	});
}

function doPause() {
	if (state != STATE_CLOSED) {
		raf.rmfPause(function(response) {
			if (response instanceof RafSuccessResponse) {
				setState(STATE_PAUSED);
				showStatus("RAF Paused");
			} else {
				showStatus("RAF Failed to Pause");
			}
		});
	}
}

function doPlay() {
	if (state != STATE_CLOSED) {
		raf.rmfPlay(1, 0, function(response) {
			if (response instanceof RafSuccessResponse) {
				setState(STATE_PLAYING);
				showStatus("RAF Playing");
			} else {
				showStatus("RAF Failed to Play");
			}
		});
	}
}

function doStop() {
	if (state != STATE_CLOSED) {
		raf.rmfStop(function(response) {
			if (response instanceof RafSuccessResponse) {
				showStatus("Stopped");
				dps_play_state = 0;
				showPlayerStatus("Stopped");
				showStepProgress("na");
				showAudioTrack("na");
				showSubtitleTrack("na");
				showVideoLevel("na");
				setFocus("playButton");
				setState(STATE_CLOSED);
				// rafsocket.releaseInstance();
				// raf = null;
			} else {
				showStatus("RAF Failed to Stop");
			}
		});
	}
}

function doDmd() {
	if (raf == null) {
		raf = rafsocket.getInstance();
		raf.addListener(onGeneralRafError, null);
		raf.addListener(onRafResponse, null);
	}
	
	// Request DMD data and display it
	raf.rmfInitRegistration(function(response) {
		if (response instanceof RafSuccessResponse) {
			raf.rmfGetDmd(function(response) {
				if (response instanceof RafSuccessResponse) {
					// process the xml blob of DMD data
					GetDmdData(response);
				//	raf.rmfCloseRegistration(function(response) { /* this doesn't work with 7241 client at the moment */
					//	;
				//	});					
				} else {
					showIdentity("DMD Hash: ", "RAF Failed to get DMD data");
				}
			});
		} else {
			showIdentity("DMD Hash: ", "FAILED - RAF DCF Registration Initialization");
		}
	});
}

function doDcfValues() {
	if (raf == null) {
		raf = rafsocket.getInstance();
		raf.addListener(onGeneralRafError, null);
		raf.addListener(onRafResponse, null);
	}
	// Request DCF Product Values and display it
	raf.rmfInitRegistration(function(response) {
		if (response instanceof RafSuccessResponse) {
			raf.rmfGetDcfValues(function(response) {
				if (response instanceof RafSuccessResponse) {
					// process the xml blob of DCF data
					GetDcfProductValues(response);
				//	raf.rmfCloseRegistration(function(response) { /* this doesn't work with 7241 client at the moment */
				//		;
				//	});	
				} else {
					showIdentity("Product Values: ", "RAF Failed to get DCF values");
				}
			});
		} else {
			showIdentity("Product Values: ", "FAILED - RAF DCF Registration Initialization");
		}
	});
}

function doStoreFrontInfo() {

		if (raf == null) {
			raf = rafsocket.getInstance();
			raf.addListener(onGeneralRafError, null);
			raf.addListener(onRafResponse, null);
		}

		// Request DCF Product Values and display it
                raf.rmfInitRegistration(function(response) {
                        if (response instanceof RafSuccessResponse) {
                                raf.rmfGetStoreFrontInfo(function(response) {
                                        if (response instanceof RafSuccessResponse) {
                                                // process the xml blob of Storefront data
                                                GetStoreFrontInfo(response);
						
                                        } else {
                                        	showIdentity("StoreFront Info: ", "RAF Failed to get StoreFrontInfo");
                                        }
                                });
                        } else {
                        	showIdentity("StoreFront Info: ", "FAILED - RAF DCF Registration Initialization");
                        }
                });
}

function doTrick(rate) {
	if (state != STATE_CLOSED) {
		raf.rmfPlay(rate, 0, function(response) {
			if (response instanceof RafSuccessResponse) {
				showStatus("RAF Trickplay [" + rate + "]");
			} else {
				showStatus("RAF Failed to Trick");
			}
		});
	}
}

function doSubtitle(index) {
	if (state != STATE_CLOSED) {
		raf.rmfSwitchSubtitle(index, function(response) {
			if (response instanceof RafSuccessResponse) {
				showStatus("RAF Subtitle Changed");
			} else {
				showStatus("RAF Subtitle Failed");
			}
		});
	}
}

function doAudio(index) {
	if (state != STATE_CLOSED) {
		raf.rmfSwitchAudio(index, function(response) {
			if (response instanceof RafSuccessResponse) {
				showStatus("RAF Audio Changed");
			} else {
				showStatus("RAF Audio Failed");
			}
		});
	}
}

function onGeneralRafError(response, context) {
	if (!(response instanceof RafErrorResponse || response instanceof RafSuccessResponse)) {

		if (rafsocket != null) {
			rafsocket.releaseInstance();
			raf = null;
		}
	}
}

function showStatus(message) {
	return;
	node = document.getElementById("status")
	var tag = document.createElement("span");
	tag.innerHTML = "&nbsp;|&nbsp;" + ": " + message;
	node.appendChild(tag);
}

function switchAudioTrack(what) {
	var selectedopt = what.options[what.selectedIndex];

	raf.rmfSwitchAudio(selectedopt.value, function(response) {
		if (response instanceof RafSuccessResponse) {
			showStatus("RAF switching audio track");
		} else {
			showStatus("RAF Failed to switch audio track");
		}
	});
}

function switchSubtitleTrack(what) {
	var selectedopt = what.options[what.selectedIndex];

	raf.rmfSwitchSubtitle(selectedopt.value, function(response) {
		if (response instanceof RafSuccessResponse) {
			showStatus("RAF switching subtitle track");
		} else {
			showStatus("RAF Failed to switch subtitle track");
		}
	});
}

function addMenuItem(menuName, itemText, id, index) {
	var menu = document.getElementById(menuName);
	var spanTag = document.createElement("span");
	spanTag.innerHTML = itemText;
	spanTag.className = "menuitem";
	spanTag.setAttribute("id", id);
	spanTag.setAttribute("index", index);

	menu.appendChild(spanTag);
	menu.appendChild(document.createElement("br"));
}

function removeAllChildren(menuName) {
	var menu = document.getElementById(menuName);
	while (menu.hasChildNodes()) {
		menu.removeChild(menu.childNodes[0]);
	}
}

function GetSubtitleStreamList(response) {
	var xml = response.getMsgNode();

	removeAllChildren("subtitleMenu");
	subtitleCount = 0;
	addMenuItem("subtitleMenu", "None", "subtitleItem-1", -1);
	var stream_node = xml.firstChild;
	while (null != stream_node) {
		addMenuItem("subtitleMenu",
				stream_node.getAttributeNode("subtitle_language").nodeValue, "subtitleItem"
						+ subtitleCount, subtitleCount);
		subtitleCount++;
		
		subtitle_streams.push({
  			language: stream_node.getAttributeNode("subtitle_language").nodeValue,
  			track_id: parseInt(stream_node.getAttributeNode("subtitle_track_id").nodeValue, 10),
  			codec: stream_node.getAttributeNode("subtitle_codec_id").nodeValue
  			});	
  		
		stream_node = stream_node.nextSibling;
	}
}

function GetAudioStreamList(response) {
	var xml = response.getMsgNode();

	removeAllChildren("audioMenu");
	audioCount = 0;
	var stream_node = xml.firstChild;
	while (null != stream_node) {
		addMenuItem("audioMenu", stream_node.getAttributeNode("audio_language").nodeValue,
				"audioItem" + audioCount, audioCount);
		audioCount++;
		
  		audio_streams.push({
  			language: stream_node.getAttributeNode("audio_language").nodeValue,
  			track_id: parseInt(stream_node.getAttributeNode("audio_track_id").nodeValue),
  			codec: stream_node.getAttributeNode("audio_codec_id").nodeValue
  			});		
		stream_node = stream_node.nextSibling;
	}
}

function GetStreamDuration(response) {
	var xml = response.getMsgNode();
	if(null != xml){
		if (xml.nodeName == "metadata") {
			var play_time = xml.getAttributeNode("video_duration").nodeValue;
			display_play_time = getDisplayTime(play_time);
		} else {
			alert("Couldn't get video duration");
		}		
	}
}

function GetDmdData(response) {
	var xml = response.getMsgNode();

	var dmd_node = xml.firstChild;
	if (null != dmd_node) {
		showIdentity("DMD Hash: ", dmd_node.nodeValue);
	}
}

function GetDcfProductValues(response) {
	var xml = response.getMsgNode();

	
	var major = xml.childNodes[0].firstChild;
	var minor = xml.childNodes[1].firstChild;
	var tags = xml.childNodes[2];
	var cred = xml.childNodes[3].firstChild;
	
	var string = '';
	var i=0;
	while(true)
	{
		if(tags.attributes[i] == null) {
			break;
		}
		string += tags.attributes[i].nodeName + ": " + tags.attributes[i].nodeValue + " ";
		i++;
	}
	if (null != major && null != minor) {
		showIdentity("Product Values: ", "[[MAJOR]]: " + major.nodeValue + " [[MINOR]]: " + minor.nodeValue + " [[TAGS]]: " + string + " [[IDENTIFIER]]: " + cred.nodeValue);
	}
}

function parseJSONResponse( response )
{
    if ( response.getType() != 'http_response' )
    {
       return null;
    }

    var jstr = response.getMsgNode().nodeValue;
    //remove all chars before '{' and after '}'
    var index = jstr.indexOf( '{' );
    if ( index > 0 )
    {
        jstr = jstr.substring( index );
    }
    index = jstr.indexOf( '}' );
    if ( index > 0 && index < jstr.length - 1 )
    {
        jstr = jstr.substring( 0, index + 1 );
    }
    var httpResponse = jQuery.parseJSON( jstr );
     
    return httpResponse;
}

function getPINRegistrationStatus( PinCode )
{
    //var url = hostName+portNumber+adapterUrl + "/registrationStatus?pin=" + PinCode + "&amp;lang=en";
    var url = hostName+portNumber+adapterUrl + "/registrationStatus";  //no PIN parameter for now
    var intervalID = -1;
    var maxDots = 4;
    var dots = [ '-', '\\', '|', '/' ];
    var count = 0;
    var startTime = 0;

    function stop()
    {
        if ( intervalID >= 0 )
        {
            clearInterval( intervalID );
            intervalID = -1;
            setEnabled("storefrontinfoButton", true);
            navNext();
    	    document.getElementById("spinId").innerHTML = '  ';	
        }
    }

    function checkStatusResponse( response )
    {
        if ( response instanceof RafSuccessResponse )  
        {
            var httpResponse = parseJSONResponse( response );
            if ( httpResponse == null || httpResponse.status == null || httpResponse.status == '' )
            {
                showIdentity( 'PIN registration failed: ', 'http request failure' );
                stop();
                return;
            }

            showIdentity( 'PIN registration result: ', httpResponse.status );
            if ( httpResponse.status == 'Complete' ||
                 httpResponse.status == 'Canceled' )
            {
               stop();
            }
        }
        else
        {
            showIdentity( "PIN registration failed: ", 'http request failure' );
        }
    }

    function getStatus()
    {
        if ( count >= maxDots )
        {
            count = 0;
            
            //check elasted time since start
            var timer = new Date();  
            if ( timer.getTime() - startTime > 30000 && intervalID >= 0 )
            {
                showIdentity( 'PIN registration failed: ', 'time out' );
                stop();
                return;            
            }
        
            raf.rmfSendHTTPGetRequest( url, checkStatusResponse ); 
        }

	showIdentity( 'Polling registration status:', PinCode );
	document.getElementById("spinId").innerHTML = '  ' + dots[count];	
        count += 1;
    }

    this.start = function()
    {
       var response = confirm( 'Please use the Registration PIN code ' + PinCode + ' to register this application to your accout. Continue?' );
       if ( response == true )
       {
           navPrevious();
  	   setEnabled("storefrontinfoButton", false);
           intervalID = setInterval( getStatus, 1000 );
           var timer = new Date();
           startTime = timer.getTime();  //save start time
       }
    }

}

function showPIN( response )  
{
    var httpResponse = parseJSONResponse( response );
    if ( httpResponse== null || httpResponse.storefrontPin == null || 
         httpResponse.storefrontPin == '' || httpResponse.success != 'true' )
    {
        showIdentity( "Request PIN failed: ", 'http request failure' );
        return;
    }

    showIdentity( "Registration PIN code: ", httpResponse.storefrontPin );
    var checkStatus = new getPINRegistrationStatus( httpResponse.storefrontPin.trim() );
    checkStatus.start();
}


function getPIN(store_id, store_token) 
{
    if (raf == null) 
    {
	raf = rafsocket.getInstance();
	raf.addListener(onGeneralRafError, null);
	raf.addListener(onRafResponse, null);
    }

    var url = hostName+portNumber+adapterUrl+"/getPin?sfId="+store_id.nodeValue +"&amp;sfToken="+store_token.nodeValue+ "&amp;lang=en";

    raf.rmfSendHTTPGetRequest(url, function(response) { 
           if (response instanceof RafSuccessResponse) 
           {
               showPIN( response );
           }
           else
           {
               showIdentity( "Request PIN failed: ", 'http request failure' );
           }
       });
}

function GetStoreFrontInfo(response) {
	var xml = response.getMsgNode();
	
	var store_id = xml.childNodes[0].firstChild;
	var store_token = xml.childNodes[1].firstChild;
	var lang = "en";

        if (null != store_id && null != store_token) 
	{
		getPIN(store_id, store_token);
	}
}


function onRafResponse(response, context) {
	if (response instanceof RafErrorResponse) {
		// Handle error response

	} else {
		parseResponse(response, context);
	}
}

function parseResponse(response, context) {
	try {
		if (response.getType() != 'rmf_response')
			return;

		var xml = response.getMsgNode();
		switch (xml.nodeName) {
		case 'status': {
			var playback_state = xml.getAttributeNode("playback_state").nodeValue;

			play_position = xml.getAttributeNode("playback_position").nodeValue;
			play_rate = xml.getAttributeNode("play_rate").nodeValue;

			/*
			 * 0 - stopped, 1 - playing, 2 - paused, 3 - connecting, 4 -
			 * buffering, 5 - finished, 6 - error
			 */
			switch (playback_state) {
			case 'STOPPED':
				dps_play_state = 0;
				showPlayerStatus("Stopped");
				showStepProgress("na");
				showAudioTrack("na");
				showSubtitleTrack("na");
				showVideoLevel("na");
				break;
			case 'RESTART':
				// this.resume();
				break;
			case 'PLAYING':
				dps_play_state = 1;
				if (state == STATE_REWIND) {
					showPlayerStatus("Rewind at " + Math.abs(play_rate) + "x");
					showVideoLevel("TT");
				} else if (state == STATE_FF) {
					showPlayerStatus("Fast Foward at " + play_rate + "x");
					showVideoLevel("TT");
				} else {
					showPlayerStatus("Playing");
				}
				break;
			case 'PAUSED':
				dps_play_state = 2;
				// Updating timer is stopped when paused, need to update
				// progress bar manually
				updateUI = true;
				showPlayerStatus("Paused");
				break;
			case 'EOF':
				dps_play_state = 5;
				play_position = play_time;
				// Add 2seconds delay to not close player so quick
				delay = 2000;
				showPlayerStatus("End of File");
				break;
			}
		}
			break;
		case 'position':
			play_position = xml.getAttributeNode("playback_position").nodeValue;
			showProgress(play_position);
			break;
		case 'error':
			break;
		case 'player_event': {
			var eventNode = xml.firstChild;
			switch (eventNode.nodeName) {
			case 'video_quality':
				playback_level = parseInt(eventNode.getAttributeNode("playback_level").nodeValue) + 1; //the level passed from DPS starts from 0
				playback_bitrate = parseInt(eventNode.getAttributeNode("playback_bitrate").nodeValue);
				if (state == STATE_PLAYING){
					showVideoLevel(playback_level);
				}
				break;

			case 'audio_info':
				// update selected track id
				selected_audio_stream = parseInt(eventNode.getAttributeNode("audio_track_id").nodeValue);
				showAudioTrack((selected_audio_stream + 1) + ", " + audio_streams[selected_audio_stream].language);
				break;

			case 'subtitle_info':
				selected_subtitle_stream = parseInt(eventNode.getAttributeNode("subtitle_track_id").nodeValue);
				if(selected_subtitle_stream == -1){
					showSubtitleTrack("none");
				}
				else{
					showSubtitleTrack((selected_subtitle_stream + 1) + ", " + subtitle_streams[selected_subtitle_stream].language);
				}
				break;
				
			case 'download_info':
				download_progress = parseInt(eventNode.getAttributeNode("progress_percentage").nodeValue);
				showPlayerStatus("Buffering");
				showDownloadProgress(download_progress);
				
				break;				
			}
		}
			break;
		}//end switch
	} catch (e) {
	}
	;
}

function showPlayerStatus(message) {
	try {
		var status = document.getElementById("statusValue");
		status.innerHTML = message;
	}
	catch (e) {
	}
}
function showVideoLevel(message) {
	try {
		var status = document.getElementById("videoLevelValue");
		status.innerHTML = message;
	}
	catch (e) {
	}
}
function showAudioTrack(message) {
	try {
		var status = document.getElementById("audioTrack");
		status.innerHTML = message;
	}
	catch (e) {
	}
}
function showSubtitleTrack(message) {
	try {
		var status = document.getElementById("subtitleTrack");
		status.innerHTML = message;
	}
	catch (e) {
	}
}

function showProgress(progress) {
	try {
		var status = document.getElementById("progressValue");

		status.innerHTML = getDisplayTime(progress) + " / " + display_play_time;
	}
	catch (e) {
	}
}

function showDownloadProgress(progress) {
	try {
		var status = document.getElementById("progressValue");

		status.innerHTML = progress + "% ";
	}
	catch (e) {
	}
}

function showStepProgress(progress) {
	try {
		var status = document.getElementById("progressValue");

		status.innerHTML = progress;
	}
	catch (e) {
	}
}

function getDisplayTime(time) {
	var hours = parseInt(time / 3600000) % 24;
	var minutes = parseInt(time / 60000) % 60;
	var seconds = parseInt(time/1000) % 60;

	var result = (hours < 10 ? "0" + hours : hours) + ":"
			+ (minutes < 10 ? "0" + minutes : minutes) + ":"
			+ (seconds < 10 ? "0" + seconds : seconds);

	return result;
}

function showIdentity(identity, value){
	try {
		document.getElementById("uniqueId").innerHTML = identity;	
		document.getElementById("uniqueIdValue").innerHTML = value;
	}
	catch (e) {
	}
}
