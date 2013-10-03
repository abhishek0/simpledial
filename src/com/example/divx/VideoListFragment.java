package com.example.divx;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Fragment;
import android.app.ListFragment;
import android.content.DialogInterface;
import android.content.DialogInterface.OnClickListener;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;

public class VideoListFragment extends Fragment implements VideoInfoAdapter.SnappedVideoListener {
	private VideoActionListener listener;
	private ArrayList<VideoInfo> list = new ArrayList<VideoInfo>();
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
		File baseFile = new File(Environment.getExternalStorageDirectory(), File.separatorChar + "video.list");
        Log.d("DIVX", "Try to get movie list from: " + baseFile.getAbsolutePath());
       

        String s = "";
        int count = 0;

        list.clear();

        // read file
        try
        {
            FileReader fr = new FileReader(baseFile);
            BufferedReader br = new BufferedReader(fr);

            while ((s = br.readLine()) != null)
            {
                String values[] = s.split(",");
                list.add(new VideoInfo(values[0],values[1],values[2]));                
                count++;
            }

            br.close();

        }
        catch (IOException e)
        {
        }        
        if (0 == count)
        {
            final AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
            builder.setTitle("Error");
            builder.setMessage("Can't find the movie list file");
            builder.setIcon(android.R.drawable.ic_dialog_alert);

            builder.setPositiveButton("OK", new OnClickListener()
            {
                public void onClick(DialogInterface dialog, int which)
                {
                    
                }
            });
            
            builder.show();
        }
		
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