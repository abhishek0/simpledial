package com.example.divx;

import java.io.IOException;
import java.util.List;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;

import com.snapstick.dial.client.Device;
import com.snapstick.dial.client.DialClient;

public class TVListFragment extends DialogFragment {
	private final Handler uiThreadHandler;
	private final TVSelectionListener tvSelectedListener;
	private View dialogLayout;
	
	public interface TVSelectionListener {
		public void tvSelected(String udid);
	}
	
	TVListFragment(TVSelectionListener listener, Handler handler, LayoutInflater inflater){
		this.tvSelectedListener = listener;
		this.uiThreadHandler = handler;
		
		dialogLayout = inflater.inflate(R.layout.spinner, null);
	}
	
	@Override
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setTitle("TVs near you");
		builder.setView(dialogLayout);
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
}
