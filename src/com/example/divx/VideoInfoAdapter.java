package com.example.divx;

import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

public class VideoInfoAdapter extends ArrayAdapter<VideoInfo> {
	Context context; 
    int layoutResourceId;    
    VideoInfo data[] = null;
    
    public VideoInfoAdapter(Context context, int layoutResourceId, VideoInfo[] data){
    	super(context, layoutResourceId, data);
    	this.layoutResourceId = layoutResourceId;
        this.context = context;
        this.data = data;
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
            
            row.setTag(holder);
    	}else{
    		holder = (VideoHolder)row.getTag();
    	}
    	
    	VideoInfo video = data[position];
        holder.txtTitle.setText(video.title);
        holder.imgIcon.setImageResource(video.icon);
        holder.url = video.url;
        
    	return row;
    }
    
    static class VideoHolder
    {
    	ImageView imgIcon;
        TextView txtTitle;
        String url;
    }
}
