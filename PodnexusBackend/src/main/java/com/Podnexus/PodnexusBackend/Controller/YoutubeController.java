package com.Podnexus.PodnexusBackend.Controller;

import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.Resource;
import com.Podnexus.PodnexusBackend.Service.YoutubeService;

@RestController
@RequestMapping("/api")
public class YoutubeController 
{
    @Autowired
    private YoutubeService youtubeService;

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
                return ResponseEntity.ok().body(output);
            }
            catch(Exception e)
            {
                // System.out.println(e.getMessage());
                return ResponseEntity.badRequest().body(e.getMessage());
            }
        }
    }

    @GetMapping("/api/audio/{fileName:.+}")
    public ResponseEntity<Resource> getAudio(@PathVariable String file) {
        
        try
        {
            Resource res =youtubeService.getFile(file);
            return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + res.getFilename() + "\"")
            .contentType(MediaType.parseMediaType("audio/mpeg")).body(res);
        }
        catch(Exception e)
        {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    
}
