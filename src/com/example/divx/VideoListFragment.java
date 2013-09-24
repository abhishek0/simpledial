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
	private View currentVideoControls = null;
	
	@Override
	public void showTVControls() {
		if (currentVideoControls != null) {
			currentVideoControls.setVisibility(View.VISIBLE);
		}		
	}

	@Override
	public void updateCurrentVideoControls(View v) {
		if (currentVideoControls != null) {
			currentVideoControls.setVisibility(View.GONE);
		}
		this.currentVideoControls = v;
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
		
		return inflater.inflate(R.layout.video_list, container, false);
    }
	
	@Override
	public void onStart(){
		super.onStart();
		list[0] = new VideoInfo(R.drawable.cat, "Moody cat with a duckling", "http://dps.edgesuite.net/DSAS/MKV/big_buck_bunny/SMIL/big_buck_bunny.smil");
		list[1] = new VideoInfo(R.drawable.puppy, "Cute puppy in lawn!", "http://192.168.1.114/test_videos/P101.smil");
		
		videoList = (ListView) getActivity().findViewById(R.id.videoList);
		VideoInfoAdapter adapter = new VideoInfoAdapter(getActivity(), R.layout.image_with_caption, list, listener, this);
		videoList.setAdapter(adapter);
		videoList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
			@Override
		    public void onItemClick(AdapterView<?> parent, final View view,
		    		int position, long id) {
				listener.startVideo(list[position]);
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
