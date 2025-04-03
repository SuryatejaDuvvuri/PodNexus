package com.Podnexus.PodnexusBackend.Controller;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.nio.file.Path;
import java.nio.file.Paths;

// import org.apache.catalina.connector.Response;
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

import com.Podnexus.PodnexusBackend.Model.TranscriptSegment;
import com.Podnexus.PodnexusBackend.Service.AIService;
import com.Podnexus.PodnexusBackend.Service.SpeechToText;
import com.Podnexus.PodnexusBackend.Service.YoutubeService;

@RestController
@RequestMapping("/api")
public class YoutubeController 
{
    @Autowired
    private YoutubeService youtubeService;

    @Autowired
    private SpeechToText stt;

    @Autowired
    private AIService aiService;

    
    

    @PostMapping("/processAudio")
    public ResponseEntity<Map <String,String>> processLink(@RequestBody Map<String, String> request)
    {
        String link = request.get("youtubeUrl");
        if(link == null || link.isEmpty())
        {
            return ResponseEntity.badRequest()
            .body(Map.of("error", "Link is not valid"));
        }
        else
        {
            try
            {
                String output = youtubeService.extractAudio(link);
                Path audioPath = Paths.get("audio-files", "One.mp3");

                File inFile = audioPath.toFile();
                System.out.println(inFile.getAbsolutePath());
                String transcript = stt.convertTranscript(inFile);
                // List<TranscriptSegment> transcript = stt.processDiarization(inFile);
                // System.out.println("AI Response: " + aiService.processTranscript(transcript));
                String aiResponse = aiService.processTranscript(transcript);
                // System.out.println(transcript);
               
                return ResponseEntity.ok().body(
                    Map.of(
                        "audioPath", output,
                        "transcript", transcript,
                        "aiResponse", aiResponse
                    ));
            }
            catch(Exception e)
            {
                // System.out.println(e.getMessage());
                return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
            }
        }
    }

    @GetMapping("/audio/{fileName:.+}")
    public ResponseEntity<Resource> getAudio(@PathVariable String fileName) {
        
        try
        {
            Resource res =youtubeService.getFile(fileName);
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
