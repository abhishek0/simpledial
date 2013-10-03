package com.example.divx;

import java.util.ArrayList;

import com.example.divx.VideoListFragment.VideoActionListener;
import com.squareup.picasso.Picasso;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

public class VideoInfoAdapter extends ArrayAdapter<VideoInfo> {
	Context context; 
    int layoutResourceId;    
    ArrayList<VideoInfo> data = null;
    VideoActionListener listener;
    View currentShown = null;
    SnappedVideoListener snapListener;
    
    public interface SnappedVideoListener {
		public void showTVControls();
		public void updateCurrentVideoControls(int index);
	}
    
    public VideoInfoAdapter(Context context, int layoutResourceId, ArrayList<VideoInfo> data, VideoActionListener listener, SnappedVideoListener snapListener){
    	super(context, layoutResourceId, data);
    	this.layoutResourceId = layoutResourceId;
        this.context = context;
        this.data = data;
        this.listener = listener;
        this.snapListener = snapListener;
    }
    
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
    	View row = convertView;
    	VideoHolder holder = null;
    	
    	if (row == null) {
    		LayoutInflater inflater = ((Activity)context).getLayoutInflater();
            row = inflater.inflate(layoutResourceId, parent, false);
            
            holder = new VideoHolder();
            holder.imgIcon = (ImageView)row.findViewById(R.id.image);
            holder.txtTitle = (TextView)row.findViewById(R.id.textLabel);
            holder.playBtn = row.findViewById(R.id.play);
            holder.pauseBtn = row.findViewById(R.id.pause);
            holder.stopBtn = row.findViewById(R.id.stop);
            holder.snapBtn = row.findViewById(R.id.snapTV);
            holder.actionBtns = row.findViewById(R.id.video_action_buttons);
            
            row.setTag(holder);
    	}else{
    		holder = (VideoHolder)row.getTag();
    	}
    	
    	final VideoInfo video = data.get(position);    	    	
        holder.txtTitle.setText(video.title);
        Picasso.with(context).load(video.icon_url).into(holder.imgIcon);
        holder.url = video.url;
        
        holder.imgIcon.setOnClickListener(new View.OnClickListener() {			
			@Override
			public void onClick(View v) {
				listener.startVideo(video);				
			}
		});        
        final int pos = position; 
        holder.snapBtn.setOnClickListener(new View.OnClickListener() {			
			@Override
			public void onClick(View v) {
				snapListener.updateCurrentVideoControls(pos);				
				listener.snapVideo(video);
			}
		});
        holder.playBtn.setOnClickListener(new View.OnClickListener() {			
			@Override
			public void onClick(View v) {
				Log.d("DIVX", "Play pushed");
				listener.play();				
			}
		});
        holder.pauseBtn.setOnClickListener(new View.OnClickListener() {			
			@Override
			public void onClick(View v) {
				Log.d("DIVX", "Pause pushed");
				listener.pause();				
			}
		});
        holder.stopBtn.setOnClickListener(new View.OnClickListener() {			
			@Override
			public void onClick(View v) {
				Log.d("DIVX", "Stop pushed");
				listener.stop();				
			}
		});
        
    	return row;
    }
    
    static class VideoHolder
    {
    	ImageView imgIcon;
        TextView txtTitle;
        View snapBtn;
        View playBtn;
        View pauseBtn;
        View stopBtn;
        View actionBtns;
        String url;        
    }
}
