package com.Podnexus.PodnexusBackend.Controller;

// import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import com.Podnexus.PodnexusBackend.Config.CorsConfig;
import com.Podnexus.PodnexusBackend.Service.AIService;
import com.Podnexus.PodnexusBackend.Service.SpeechToText;
import com.Podnexus.PodnexusBackend.Service.TextToSpeech;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class PodcastController 
{

    @Autowired
    private AIService ai;

    @Autowired
    private SpeechToText stt;

    @Autowired
    private TextToSpeech tts;

    // private final ChatClient chatClient;

    // public PodcastController(ChatClient.Builder chatClient)
    // {
    //     this.chatClient = chatClient.build();
    // }

    // @PostMapping("/analyzeAudio")
    // public String analyzeAudio(@RequestBody String entity) {
    //    return chatClient.user("text")
    // }

    @PostMapping("/analyzeAudio")
    public ResponseEntity<Map<String, String>> analyzeAudio(@RequestParam("file") MultipartFile audio, @RequestParam(value = "timestamp", required = false) String timestamp)
    {
        
        try
        {
            String projectDir = System.getProperty("user.dir");
            Path audioPath = Paths.get(projectDir,  "audio-files");
            Path fileName = audioPath.resolve("User.webm");
            if(!Files.exists(audioPath))
            {
                Files.createDirectories(audioPath);
            }

            File inFile = fileName.toFile();
            audio.transferTo(inFile);
            System.out.println("File: " + inFile.getAbsolutePath());
            String script =  stt.convertTranscript(inFile);

            if(script.isEmpty())
            {
                return ResponseEntity.badRequest().body(Map.of("error", "Audio file is empty or not valid"));
            }
            String response = timestamp != null && !timestamp.isEmpty() 
            ? String.format("User question at %s: %s", timestamp, script)
            : script;
            String aiResponse = ai.respondToUser(response);
         
            System.out.println("AI Response: " + aiResponse);

            String responseFile = tts.convertToSpeech(aiResponse);



            return ResponseEntity.ok(Map.of(
                "script", aiResponse,
                "response", responseFile
            ));
        }
        catch (Exception e)
        {
            return ResponseEntity.badRequest().body(Map.of("error", "Error processing audio file: " + e.getMessage()));
        }
          

       
    }
    
    

    

}
