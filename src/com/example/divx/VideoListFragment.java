package com.example.divx;

import android.app.Activity;
import android.app.ListFragment;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;

public class VideoListFragment extends ListFragment {
	VideoActionListener mCallback;
	VideoInfo[] list = new VideoInfo[2];
	
	public interface VideoActionListener {
		public void takeActionOnVideo(VideoInfo v);
	}
	
	@Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        
        // This makes sure that the container activity has implemented
        // the callback interface. If not, it throws an exception
        try {
            mCallback = (VideoActionListener) activity;
        } catch (ClassCastException e) {
            throw new ClassCastException(activity.toString()
                    + " must implement OnHeadlineSelectedListener");
        }
    }
	
	@Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
		
		list[0] = new VideoInfo(R.drawable.cat, "Moody cat with a duckling", "http://dps.edgesuite.net/DSAS/MKV/big_buck_bunny/SMIL/big_buck_bunny.smil");
		list[1] = new VideoInfo(R.drawable.puppy, "Cute puppy in lawn!", "http://dps.edgesuite.net/DSAS/MKV/big_buck_bunny/SMIL/big_buck_bunny.smil");
		        
		VideoInfoAdapter adapter = new VideoInfoAdapter(getActivity(), R.layout.image_with_caption, list);
		
		setListAdapter(adapter);
		
		return super.onCreateView(inflater, container, savedInstanceState);
    }
	
	@Override
	public void onListItemClick (ListView l, View v, int position, long id) {
		v.findViewById(R.id.textLabel).setVisibility(View.VISIBLE);
		//mCallback.takeActionOnVideo(list[position]);
	}
}
