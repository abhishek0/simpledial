package com.example.divx;

import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.MulticastLock;
import android.os.Bundle;
import android.os.StrictMode;
import android.app.Activity;
import android.app.DialogFragment;
import android.content.Context;
import android.util.Log;
import android.view.Menu;

public class MainActivity extends Activity implements VideoListFragment.VideoActionListener {
	Boolean init = false;
	DialogFragment TVs;
	MulticastLock multicastLock = null;
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
	}

	public void takeActionOnVideo(VideoInfo v) {
    	Log.d("DIVX", v.title);
    	if (!init) {
    		TVs = new TVListFragment();
    		TVs.show(getFragmentManager(), "dialog");
    	}
    }
}
