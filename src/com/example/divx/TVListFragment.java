package com.example.divx;

import java.io.IOException;
import java.util.List;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;
import android.util.Log;
import android.widget.ArrayAdapter;

import com.snapstick.dial.client.Device;
import com.snapstick.dial.client.DialClient;

public class TVListFragment extends DialogFragment {
	@Override
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		List<Device> devices;
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
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(getActivity(), android.R.layout.simple_list_item_1, names);
	    AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
	    builder.setTitle("TVs near you");
	    builder.setAdapter(adapter, new DialogInterface.OnClickListener() {
	               public void onClick(DialogInterface dialog, int which) {
	               // The 'which' argument contains the index position
	               // of the selected item
	            	   Log.d("DIVX", "mamu");
	               }
	           });
	    return builder.create();
	}
}
