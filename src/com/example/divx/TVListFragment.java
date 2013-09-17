package com.example.divx;

import java.io.IOException;
import java.util.List;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.app.Fragment;
import android.app.LoaderManager;
import android.content.AsyncTaskLoader;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Loader;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;

import com.snapstick.dial.client.Device;
import com.snapstick.dial.client.DialClient;

public class TVListFragment extends Fragment implements LoaderManager.LoaderCallbacks {
	private final TVSelectionListener tvSelectedListener;
	private	TVFragmentUIManager uiManager;
	
	public interface TVSelectionListener {
		public void tvSelected(String udid);
	}
	public interface TVListManager {
		public void showListOfTVs(List<Device> data, TVSelectionListener listener);
		public void showErrorMessage();
		public void showLoading();
	}
	
	TVListFragment(TVSelectionListener listener){
		this.tvSelectedListener = listener;
	}
		
	@Override
	public Loader onCreateLoader(int id, Bundle args) {
		Log.d("DIVX", "Inside create loader");
		return new DIALLoader(getActivity(), args);
	}
	@Override
	public void onLoadFinished(Loader loader, Object arg) {
		Log.d("DIVX", "Inside loader finished");
		List<Device> tvs = (List<Device>)arg;
		if (tvs != null && tvs.size() != 0) {			
			uiManager.showListOfTVs(tvs, tvSelectedListener);
		}else{
			uiManager.showErrorMessage();
		}
	}

	@Override
	public void onLoaderReset(Loader arg0) {
		// TODO Auto-generated method stub
		
	}
	
	@Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
		Log.d("DIVX", "Creating TV list view");		
		return inflater.inflate(R.layout.tv_list_fragment, container, false);
	}
	
	@Override
	public void onStart(){
		super.onStart();
		uiManager = new TVFragmentUIManager(getActivity());
		Button refresh_btn = (Button)getActivity().findViewById(R.id.refresh_tv_list);
		refresh_btn.setOnClickListener(new View.OnClickListener() {
		    public void onClick(View v) {
		    	uiManager.showLoading();
		    	tryAgain();
		    }
		});
		findTVs();
	}
	
	@SuppressWarnings("unchecked")
	public void findTVs() {
		Log.v("DIVX", "Initiate TV search");
		getLoaderManager().initLoader(0, null, this).forceLoad();
	}
	
	@SuppressWarnings("unchecked")
	public void tryAgain() {
		getLoaderManager().restartLoader(0, null, this).forceLoad();
	}
	
	private class TVFragmentUIManager implements TVListManager {
		private ListView tvList;
		private View progressBar, errorMsg;
		private Activity activity;
		
		public TVFragmentUIManager(Activity a) {
			this.tvList = (ListView) a.findViewById(R.id.tvList);
			this.progressBar = a.findViewById(R.id.progressBar1);
			this.errorMsg = a.findViewById(R.id.tv_error_msg);
			this.activity = a;
		}
		
		@Override
		public void showListOfTVs(List<Device> data, TVSelectionListener listener) {
			final TVSelectionListener tvSelectedListener = listener;
			final Device[] tvs = data.toArray(new Device[data.size()]);
			
			String[] names = new String[data.size()];
			for(int i = 0; i<tvs.length; i++) {
				names[i] = tvs[i].getName();				
			}
			ArrayAdapter<String> adapter = new ArrayAdapter<String>(activity, android.R.layout.simple_list_item_single_choice, names);
			tvList.setAdapter(adapter);
			tvList.setVisibility(View.VISIBLE);
			tvList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
				@Override
			    public void onItemClick(AdapterView<?> parent, final View view,
			    		int position, long id) {
					tvs[position].startApplication("Snapstick");
  					String udid = tvs[position].getUDN();
   					tvSelectedListener.tvSelected(udid);
			    }

			});
			progressBar.setVisibility(View.GONE);
		}
		@Override
		public void showErrorMessage() {
			errorMsg.setVisibility(View.VISIBLE);
			progressBar.setVisibility(View.GONE);
		}
		
		@Override
		public void showLoading() {
			tvList.setVisibility(View.GONE);
			errorMsg.setVisibility(View.GONE);
			progressBar.setVisibility(View.VISIBLE);
		}
	}
	
	private static class DIALLoader extends AsyncTaskLoader {
		private int numTries = 0;
		private int maxTries = 3;
		private List<Device> devices;
		
		DIALLoader(Context context, Bundle args){
			super(context);			
		}
		
		private Boolean retrieveDevices() {			
			Log.d("DIVX", "retreive devices");
			try {
				devices = DialClient.getDeviceList();
			} catch (IOException e) {
				devices = null;
			}
			return (devices != null && devices.size() != 0);
		}
		public List<Device> loadInBackground(){
			Log.d("DIVX", "Inside load in background");
			while (!retrieveDevices() && numTries < maxTries) {
				numTries++;
				try {
					Thread.sleep(2000);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
			
			return devices;
		}
	}
}