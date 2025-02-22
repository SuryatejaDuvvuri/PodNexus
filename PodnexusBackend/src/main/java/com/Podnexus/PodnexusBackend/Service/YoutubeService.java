package com.Podnexus.PodnexusBackend.Service;
import org.springframework.stereotype.Service;

import com.google.api.client.util.Value;
import com.sapher.youtubedl.YoutubeDL;
import com.sapher.youtubedl.YoutubeDLRequest;
import com.sapher.youtubedl.YoutubeDLResponse;
@Service
public class YoutubeService {
    
    // @Value({"${youtube.dl.path}"})
    // private String youtubeDLPath;

    public String extractAudio(String url) throws Exception
    {
        try
        {
            YoutubeDL.setExecutablePath("yt-dlp");
            YoutubeDLRequest request = new YoutubeDLRequest(url);
            request.setOption("extract-audio");
            request.setOption("audio-format", "mp3");
            request.setOption("output", "%(title)s.%(ext)s");
            YoutubeDLResponse response = YoutubeDL.execute(request);
            return response.getOut();
        }
        catch(Exception e)
        {
            System.err.println(e.getMessage());
            return "Audio couldn't be processed.";
        }


    }
}
