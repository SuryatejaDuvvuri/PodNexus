package com.Podnexus.PodnexusBackend.Controller;

import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Podnexus.PodnexusBackend.Service.YoutubeService;

@RestController
@RequestMapping("/api")
public class YoutubeController 
{
    @Autowired
    private final YoutubeService youtubeService;

    public YoutubeController(YoutubeService youtubeService)
    {
        this.youtubeService = youtubeService;
    }

    @PostMapping("/processAudio")
    public ResponseEntity<String> processLink(@RequestBody Map<String, String> request)
    {
        String link = request.get("youtubeUrl");
        if(link == null || link.isEmpty())
        {
            return ResponseEntity.badRequest().body("Link is not valid");
        }
        else
        {
            try
            {
                String output = youtubeService.extractAudio(link);
                return ResponseEntity.ok().body("Link is recieved: " + output);
            }
            catch(Exception e)
            {
                // System.out.println(e.getMessage());
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }

       
    }
}
