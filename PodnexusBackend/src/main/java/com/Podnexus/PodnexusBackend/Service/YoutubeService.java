package com.Podnexus.PodnexusBackend.Service;
import org.springframework.stereotype.Service;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.util.StringUtils;
import com.google.api.client.util.Value;
import com.sapher.youtubedl.YoutubeDL;
import com.sapher.youtubedl.YoutubeDLRequest;
import com.sapher.youtubedl.YoutubeDLResponse;
import java.nio.file.Path;
import java.nio.file.Paths;
// import java.util.Date;
import java.nio.file.Files;

@Service
public class YoutubeService {
    
    // @Value({"${youtube.dl.path}"})
    // private String youtubeDLPath;

    private final Path audioLocation;
    public YoutubeService()
    {
        this.audioLocation = Paths.get("audio-files");
        try
        {
            Files.createDirectories(this.audioLocation);
        }
        catch(Exception e)
        {
            throw new RuntimeException("Could not retrieve files.");
        }
    }

    public String extractAudio(String url) throws Exception
    {
        try
        {
            YoutubeDL.setExecutablePath("yt-dlp");
            String fileName = "One.mp3";
            Path out = audioLocation.resolve(fileName);
            YoutubeDLRequest request = new YoutubeDLRequest(url);
            request.setOption("extract-audio");
            request.setOption("audio-format", "mp3");
            // request.setOption("output", "%(title)s.%(ext)s");
            request.setOption("output", out.toString());
            YoutubeDLResponse response = YoutubeDL.execute(request);
            // return response.getOut();
            return "/api/audio/" + fileName;
        }
        catch(Exception e)
        {
            System.err.println(e.getMessage());
            return "Audio couldn't be processed.";
        }
    }

    public Resource getFile(String file) 
    {
        try
        {
           Path pa = audioLocation.resolve(file);
           Resource res = new UrlResource(pa.toUri());

           if(res.exists())
           {
                return res;
           }
           else
           {
                throw new RuntimeException("Could not read the file.");
           }
        }
        catch(Exception e)
        {
            System.err.println(e.getMessage());
            throw new RuntimeException("Could not process the file.");
        }
        
    }
}
