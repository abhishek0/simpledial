package com.example.divx;

import java.io.IOException;
import java.util.List;

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
import android.widget.ArrayAdapter;
import android.widget.ListView;

import com.snapstick.dial.client.Device;
import com.snapstick.dial.client.DialClient;

public class TVListFragment extends Fragment implements LoaderManager.LoaderCallbacks {
	private final Handler uiThreadHandler;
	private final TVSelectionListener tvSelectedListener;	
	
	public interface TVSelectionListener {
		public void tvSelected(String udid);
	}
	
	TVListFragment(TVSelectionListener listener, Handler handler){
		this.tvSelectedListener = listener;
		this.uiThreadHandler = handler;				
	}
	
	@Override
	public Loader onCreateLoader(int id, Bundle args) {
		Log.d("DIVX", "Inside create loader");
		return new DIALLoader(getActivity(), args);
	}
	@Override
	public void onLoadFinished(Loader loader, Object arg) {
		Log.d("DIVX", "Inside loader finished");
		List<Device> data = (List<Device>)arg;		
		if (data != null && data.size() != 0) {
			int i = 0;			
			String[] names = new String[data.size()];
			for(Device d: data) {
				names[i] = d.getName();
				i++;
			}
			ArrayAdapter<String> adapter = new ArrayAdapter<String>(getActivity(), android.R.layout.simple_list_item_single_choice, names);
			ListView tvs = (ListView) getActivity().findViewById(R.id.tvList);
			tvs.setAdapter(adapter);
			tvs.setVisibility(View.VISIBLE);
			getActivity().findViewById(R.id.progressBar1).setVisibility(View.GONE);
		}else{
			Log.d("DIVX","Oops cannot load TVs");
		}
	}

	@Override
	public void onLoaderReset(Loader arg0) {
		// TODO Auto-generated method stub
		
	}
	
	/*@Override
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setTitle("TVs near you");
		//builder.setView(dialogLayout);
		return builder.create();
	}
		/*List<Device> devices;
		
		try {
			devices = DialClient.getDeviceList();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			devices = null;
		}
		
		int i = 0;
		
		String[] names = new String[devices.size()];
		for(Device d: devices) {
			names[i] = d.getName();
			i++;
		}
		final List<Device> s = devices;
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(getActivity(), android.R.layout.simple_list_item_1, names);
	    AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
	    builder.setTitle("TVs near you");
	    builder.setAdapter(adapter, new DialogInterface.OnClickListener() {
	               public void onClick(DialogInterface dialog, int which) {
	               // The 'which' argument contains the index position
	               // of the selected item
	            	   int i = 0;
	            	   for(Device d: s) {
	           			if (i==which) {
	           				d.startApplication("Snapstick");
	           				if (tvSelectedListener != null) {
	           					String udid = d.getUDN();
	           					tvSelectedListener.tvSelected(udid);
	           				}
	           				Log.d("DIVX", "Selected TV no. " + i);
	           				break;
	           			}
	           			i++;
	           		}
	               }
	           });
	    return builder.create();
	}*/
	
	@Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
		Log.d("DIVX", "Creating TV list view");
		return inflater.inflate(R.layout.tv_list_fragment, container, false);		
	}
	
	@SuppressWarnings("unchecked")
	public void findTVs() {
		Log.v("DIVX", "Initiate TV search");
		getLoaderManager().initLoader(0, null, this).forceLoad();
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
