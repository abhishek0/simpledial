package com.example.divx;

import android.app.Activity;
import android.app.Fragment;
import android.app.ListFragment;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;

public class VideoListFragment extends Fragment {
	private VideoActionListener listener;
	private VideoInfo[] list = new VideoInfo[2];
	private ListView videoList;
	private View progressBar;
	private int videoRunning = 0;
	
	public interface VideoActionListener {
		public void startVideo(VideoInfo v);
		public void play();
		public void pause();
		public void stop();
	}
	
	VideoListFragment(VideoActionListener listener) {
		this.listener = listener;
	}
	
	@Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
		
		return inflater.inflate(R.layout.video_list, container, false);
    }
	
	@Override
	public void onStart(){
		super.onStart();
		list[0] = new VideoInfo(R.drawable.cat, "Moody cat with a duckling", "http://dps.edgesuite.net/DSAS/MKV/big_buck_bunny/SMIL/big_buck_bunny.smil");
		list[1] = new VideoInfo(R.drawable.puppy, "Cute puppy in lawn!", "http://dps.edgesuite.net/DSAS/MKV/big_buck_bunny/SMIL/big_buck_bunny.smil");
		        
		VideoInfoAdapter adapter = new VideoInfoAdapter(getActivity(), R.layout.image_with_caption, list);
		videoList = (ListView) getActivity().findViewById(R.id.videoList);
		videoList.setAdapter(adapter);
		videoList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
		    public void onItemClick(AdapterView<?> parent, final View view,
		    		int position, long id) {
				videoList.getChildAt(videoRunning).findViewById(R.id.video_action_buttons).setVisibility(View.GONE);
				videoRunning = position;
				View buttons = view.findViewById(R.id.video_action_buttons);
				buttons.setVisibility(View.VISIBLE);
				listener.startVideo(list[position]);
				
				buttons.findViewById(R.id.play).setOnClickListener(new View.OnClickListener() {					
					@Override
					public void onClick(View v) {
						Log.d("DIVX", "Play pushed");
						listener.play();
					}
				});
				buttons.findViewById(R.id.pause).setOnClickListener(new View.OnClickListener() {					
					@Override
					public void onClick(View v) {
						Log.d("DIVX", "Pause pushed");
						listener.pause();
					}
				});
				buttons.findViewById(R.id.stop).setOnClickListener(new View.OnClickListener() {					
					@Override
					public void onClick(View v) {
						Log.d("DIVX", "Stop pushed");
						listener.stop();
					}
				});
		    }
		});
		
		progressBar = getActivity().findViewById(R.id.progressBar2);		
	}
	
	public void showVideos() {
		progressBar.setVisibility(View.GONE);
	}
	
	public void showLoading() {
		progressBar.setVisibility(View.VISIBLE);
	}
}
