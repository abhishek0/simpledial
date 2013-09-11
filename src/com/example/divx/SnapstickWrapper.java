package com.example.divx;

import java.util.List;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.snapstick.client.devices.SnapstickDevice;
import com.snapstick.client.library.SnapstickCallback;
import com.snapstick.client.library.SnapstickClient;

public class SnapstickWrapper implements SnapstickCallback {
	public interface SnapstickEventListener {
		public void handleEvent(int type, String data);
		public void updateDeviceList(SnapstickDevice ldev);
	}
	
	private static SnapstickWrapper instance;
	
	private SnapstickEventListener mActivity;
	
	private SnapstickClient client;
	
	private Handler mainThreadHandler;
	
	private String ClientList;
		
	public synchronized static SnapstickWrapper getInstance(Context context) {
		if (instance == null) {
			instance = new SnapstickWrapper(context);
		}
		return instance;
	}
	
	public void setActivity(SnapstickEventListener refAct) {
		mActivity = refAct;
	}
	
	private SnapstickWrapper(Context context) {
		client = SnapstickClient.getInstance(context, this);
		this.mainThreadHandler = new Handler(Looper.getMainLooper());
	}

	public void init() {
		client.init();
	}
	
	public void connect(String code) {
		client.connect(code);
	}
	
	public void connectWithUdid(String udid) {
		client.connectWithUdid(udid);
	}
	
	public void sendCustomMessage(String message) {
		client.sendCustomMessage(message);
	}
	
	@Override
	public void onDeviceDisconnect() {
		Log.v("TESTING", "Connection closed ...");
		SendEventToActivity(0,null);
		client.getDevices();
	}

	@Override
	public void onRecvDevices(List<SnapstickDevice> deviceList) {
		Log.v("TESTING", "Device list received ...");
		for(int i=0; i < deviceList.size(); i++) {
			addDeviceToList(deviceList.get(i));
		}
	}

	@Override
	public void onDeviceConnect() {
		Log.v("TESTING", "Connection established ...");
		client.getClientList();
		SendEventToActivity(1,null);
	}

	@Override
	public void onReady() {
		Log.v("TESTING", "Client ready ...");
		SendEventToActivity(2,null);
		client.getDevices();
	}

	@Override
	public void onInitError() {
		Log.v("TESTING", "Initialization error ...");
		SendEventToActivity(3,null);
	}
	
	@Override
	public void onData(String data) {
		String msg = parseData(0,data);
		SendEventToActivity(4,msg);
	}
	
	@Override
	public void onRecvPeerClientConnect(String data) {
		String msg = "Client " + parseData(1,data) + " connected...";
		client.getClientList();
		SendEventToActivity(4,msg);
	}

	@Override
	public void onRecvPeerClientDisconnect(String data) {
		String msg = "Client " + parseData(1,data) + " disconnected...";
		client.getClientList();
		SendEventToActivity(4,msg);
	}
	
	@Override
	public void onRecvClientList(String data) {
		ClientList = data;
		SendEventToActivity(5,data);
	}
	
	public String parseData(int msg_type, String data) {
		JSONObject msgObj = null;
		String finalmsg = null;
		String name = null;
		try {
			JSONObject recvData = new JSONObject(data);
			switch(msg_type) {
				case 0:
					String type = recvData.getString("type");
					if(type.equals("custom")) {
						msgObj = recvData.getJSONObject("payload");
						String message = msgObj.getString("message");
						String fromClient = msgObj.getString("fromClient");
						msgObj = new JSONObject(ClientList);
						String fromName = parseData(2,msgObj.getJSONObject(fromClient).toString());
						finalmsg = fromName + ": " +  message;
					}
					break;
				case 1:
					finalmsg = parseData(2,recvData.getJSONObject("message").toString());
					break;
				case 2:
					msgObj = recvData.getJSONObject("clientData");
					name = msgObj.getString("name");
					finalmsg = name;
					break;
			}
		} catch(JSONException e) {
			Log.v("TESTING", "Cannot parse json data properly...");
		}
		return finalmsg;
	}
	
	public void SendEventToActivity(final int evttype, final String evt_message)
	{
		this.mainThreadHandler.post(new Runnable() {
			private int type = evttype;
			private String local_message = evt_message;
			
			public void run() {
				try {
					mActivity.handleEvent(this.type, this.local_message);
				}
				catch(Exception e) {
					e.printStackTrace();
				}
			}
		});
	}
	
	public void addDeviceToList(final SnapstickDevice ldev) {
		this.mainThreadHandler.post(new Runnable() {
			public void run() {
				try {
					mActivity.updateDeviceList(ldev);
				}
				catch(Exception e) {
					e.printStackTrace();
				}
			}
		});
	}
}