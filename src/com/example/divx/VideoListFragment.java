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

public class VideoListFragment extends Fragment implements VideoInfoAdapter.SnappedVideoListener {
	private VideoActionListener listener;
	private VideoInfo[] list = new VideoInfo[2];
	private ListView videoList;
	private View progressBar;
	private int currentVideoIndex = -1;
	
	@Override
	public void showTVControls() {
		if (currentVideoIndex != -1 && videoList != null) {
			videoList.getChildAt(currentVideoIndex)
				.findViewById(R.id.video_action_buttons)
				.setVisibility(View.VISIBLE);
		}		
	}

	@Override
	public void updateCurrentVideoControls(int index) {
		if (currentVideoIndex != -1 && videoList != null) {
			videoList.getChildAt(currentVideoIndex)
			.findViewById(R.id.video_action_buttons)
			.setVisibility(View.GONE);
		}
		this.currentVideoIndex = index;
		showTVControls();
	}
	
	
	public interface VideoActionListener {
		public void startVideo(VideoInfo v);
		public void play();
		public void pause();
		public void stop();
		public void snapVideo(VideoInfo v);
	}
	
	VideoListFragment(VideoActionListener listener) {
		this.listener = listener;
	}
	
	@Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
		list[0] = new VideoInfo(R.drawable.cat, "Moody cat with a duckling", "http://dps.edgesuite.net/DSAS/MKV/big_buck_bunny/SMIL/big_buck_bunny.smil");
		list[1] = new VideoInfo(R.drawable.puppy, "Cute puppy in lawn!", "http://192.168.1.114/test_videos/P101.smil");
		
		View vToReturn = inflater.inflate(R.layout.video_list, container, false);
		
		videoList = (ListView)vToReturn.findViewById(R.id.videoList);
		VideoInfoAdapter adapter = new VideoInfoAdapter(getActivity(), R.layout.image_with_caption, list, listener, this);
		videoList.setAdapter(adapter);
		
		progressBar = vToReturn.findViewById(R.id.progressBar2);
		
		return vToReturn;
    }
	
	@Override
	public void onStart(){
		super.onStart();
		showTVControls();
	}
	
	public void showVideos() {
		progressBar.setVisibility(View.GONE);
	}
	
	public void showLoading() {
		progressBar.setVisibility(View.VISIBLE);
	}	
}