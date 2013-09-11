package com.example.divx;

import com.snapstick.client.devices.SnapstickDevice;

import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.MulticastLock;
import android.os.Bundle;
import android.os.StrictMode;
import android.app.Activity;
import android.app.DialogFragment;
import android.content.Context;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.webkit.CookieManager;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity implements VideoListFragment.VideoActionListener, SnapstickWrapper.SnapstickEventListener, TVListFragment.TVSelectionListener {
	Boolean init = false;
	TVListFragment TVs;
	MulticastLock multicastLock = null;
	
	Boolean isTVConnected = false;
	Boolean snapstickReady = false;
	SnapstickWrapper mWrapper;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);        
        if (android.os.Build.VERSION.SDK_INT > 9) {
            StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
            StrictMode.setThreadPolicy(policy);
        }
        WifiManager wifi = (WifiManager) getSystemService(Context.WIFI_SERVICE);
        multicastLock = wifi.createMulticastLock("DIVX_DIAL_MULTICAST");
        multicastLock.setReferenceCounted(true);
        multicastLock.acquire();
        
        //This is required to be set in the application project, as Snapstick Library requires this (but can't be set in Android Library project)
        CookieManager.setAcceptFileSchemeCookies(true);
        
        mWrapper = SnapstickWrapper.getInstance(getApplicationContext());
		mWrapper.setActivity(this);
		mWrapper.init();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }
    
    @Override
	protected void onDestroy() {
		// TODO Auto-generated method stub
		super.onDestroy();
		
		if (multicastLock != null && multicastLock.isHeld()) {
			multicastLock.release();
		}
		mWrapper.setActivity(null);
		mWrapper = null;
	}

	public void takeActionOnVideo(VideoInfo v) {
    	Log.d("DIVX", v.title);
    	if (!isTVConnected && snapstickReady) {
    		TVs = new TVListFragment();
    		TVs.setSelectionListener(this);
    		TVs.show(getFragmentManager(), "dialog");
    	} else if (isTVConnected) {
    		//Snap the video url
    	}
    }
	
	public void handleEvent(int type, String data) {		
		switch(type)
		{
			case 0:
				Toast toast = Toast.makeText(getApplicationContext(), "Cannot connect to TV.", Toast.LENGTH_SHORT);
				toast.show();
				isTVConnected = false;
				break;
			case 1:
				break;
			case 2:
				Log.d("DIVX", "snapstick is ready");
				snapstickReady = true;
				break;
			case 3:				
				break;
			case 4:				
				break;
			case 5:
				break;
			default:
				break;
		}
	}
	
	public void updateDeviceList(SnapstickDevice ldev) {
		
	}
	
	public void tvSelected(String udid) {
		Log.d("DIVX", "tv selected udid - "+udid);
		if (snapstickReady) {
			mWrapper.connectWithUdid(udid);
		}
	}
}
