package com.Podnexus.PodnexusBackend.Service;
import org.springframework.stereotype.Service;
import com.sapher.youtubedl.YoutubeDL;
import com.sapher.youtubedl.YoutubeDLRequest;
import com.sapher.youtubedl.YoutubeDLResponse;
@Service
public class YoutubeService {
    
    private String url;
    
    public String getUrl()
    {
        return url;
    }

    public void setUrl()
    {
        this.url = url;
    }

    public String extractAudio(String url)
    {
        YoutubeDLRequest request = new YoutubeDLRequest(url);
        request.setOption("extract-audio");
        request.setOption("audio-format", "mp3");
        request.setOption("output", "%(title)s.%(ext)s");

        YoutubeDLResponse response = YoutubeDL.execute(request);
        return response.getOut();

    }
}
