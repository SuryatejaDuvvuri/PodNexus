package com.Podnexus.PodnexusBackend.Controller;

import org.apache.catalina.connector.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.Podnexus.PodnexusBackend.Service.YoutubeService;

@RestController
@RequestMapping("/api")
public class YoutubeController 
{
    private final YoutubeService youtubeService;

    public YoutubeController(YoutubeService youtubeService)
    {
        this.youtubeService = youtubeService;
    }

    @RequestMapping("/audio")
    public String getAudio()
    {
        return youtubeService.getAudio();
    }

    @PostMapping("/audio")
    public ResponseEntity<String> postAudio(@RequestBody YoutubeService request)
    {
        try
        {
            youtubeService.extractAudio(request.getUrl());
            return ResponseEntity.ok("Audio extracted");
        }
        catch (Exception e)
        {
            return ResponseEntity.badRequest();
        }
    }
}
