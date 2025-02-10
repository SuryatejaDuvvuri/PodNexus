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
    public ResponseEntity<Audio> postAudio(@RequestBody Audio audio)
    {
        try
        {
            youtubeService.extractAudio(audio.getAudio());
            return ResponseEntity.ok(audio);
        }
        catch (Exception e)
        {
            return ResponseEntity.badRequest();
        }
    }
}
