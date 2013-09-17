package com.example.divx;

import com.snapstick.client.devices.SnapstickDevice;

import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.MulticastLock;
import android.os.Bundle;
import android.os.Handler;
import android.os.StrictMode;
import android.app.Activity;
import android.app.DialogFragment;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.content.Context;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.webkit.CookieManager;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity implements VideoListFragment.VideoActionListener, SnapstickWrapper.SnapstickEventListener, TVListFragment.TVSelectionListener {	
	private MulticastLock multicastLock = null;
	
	private VideoListFragment VideoManager;
	private TVListFragment TVManager;
	
	private Boolean isTVConnected = false;
	private Boolean snapstickReady = false;
	
	private String currentTVUDID;
	private SnapstickWrapper mWrapper;
	
	private MainUIManager uiManager;
	
	private Handler mHandler = new Handler();
	
	private int snapstickReconnectTries = 0;
	
	public interface MainUIManager {
		public void showTVList();
		public void showVideoList();		
		//public void showWIFIErrorScreen();
	}
	
	private class UIManager implements MainUIManager {
		private Fragment tvList;
		private Fragment videoList;
		private FragmentManager m;
		
		public UIManager(FragmentManager m, Fragment tvList, Fragment videoList) {
			this.tvList = tvList;
			this.videoList = videoList;
			this.m = m;
		}
		@Override
		public void showTVList() {
			m.beginTransaction()
			.setCustomAnimations(android.R.animator.fade_in, android.R.animator.fade_out)
			.replace(R.id.fragment_container, tvList)
			.commit();
		}		

		@Override
		public void showVideoList() {
			m.beginTransaction()
			.setCustomAnimations(android.R.animator.fade_in, android.R.animator.fade_out)
			.replace(R.id.fragment_container, videoList)
			.commit();
		}		
	}
	
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
		
		TVManager = new TVListFragment(this);
		VideoManager = new VideoListFragment(this);
		
		uiManager = new UIManager(getFragmentManager(), TVManager, VideoManager);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }
    
    @Override
	protected void onDestroy() {
		super.onDestroy();
		
		if (multicastLock != null && multicastLock.isHeld()) {
			multicastLock.release();
		}
		mWrapper.setActivity(null);
		mWrapper = null;
	}
    
    @Override
	public void startVideo(VideoInfo v) {
		if (isTVConnected) {
			String msgStartVideo = "{\"message\": \"start\", \"url\": \"" + v.url + "\"}";
			Log.d("DIVX","Sending video message - " + msgStartVideo);
			mWrapper.sendCustomMessage(msgStartVideo);
		}
    }
    
    @Override
	public void play() {
    	String msg = "{\"message\": \"play\"}";
    	Log.d("DIVX","Sending play message");
		mWrapper.sendCustomMessage(msg);
    }
    
    @Override
	public void pause() {
    	String msg = "{\"message\": \"pause\"}";
    	Log.d("DIVX","Sending pause message");
		mWrapper.sendCustomMessage(msg);
    }
    @Override
	public void stop() {
    	String msg = "{\"message\": \"stop\"}";
    	Log.d("DIVX","Sending stop message");
		mWrapper.sendCustomMessage(msg);
    }
    
	@Override
	public void handleEvent(int type, String data) {		
		switch(type)
		{
			case 0:
				mHandler.postDelayed(new Runnable(){
					public void run() {
						if (snapstickReconnectTries < 5) {
							Log.d("DIVX", "Trying to connect with UDID - " + currentTVUDID);
							mWrapper.connectWithUdid(currentTVUDID);
						}else{
							Toast toast = Toast.makeText(getApplicationContext(), "Cannot connect to TV.", Toast.LENGTH_SHORT);
							toast.show();
							isTVConnected = false;
							snapstickReconnectTries = 0;
							uiManager.showTVList();							
						}
						snapstickReconnectTries++;
					}
				}, 2000);				
				break;
			case 1:
				isTVConnected = true;
				VideoManager.showVideos();
				break;
			case 2:
				Log.d("DIVX", "snapstick is ready");
				snapstickReady = true;
				uiManager.showTVList();
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
	
	@Override
	public void tvSelected(String udid) {
		Log.d("DIVX", "tv selected udid - "+udid);
		currentTVUDID = udid;
		if (snapstickReady) {
			mWrapper.connectWithUdid(udid);
			uiManager.showVideoList();			
		}
	}

	@Override
	public void updateDeviceList(SnapstickDevice ldev) {
		// TODO Auto-generated method stub
		
	}
	
	public void eatClicks(View v){
		// Do nothing
		v.setSoundEffectsEnabled(false);
	}
}
