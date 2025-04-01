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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.io.File;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PodcastController 
{

    @Autowired
    private AIService ai;

    @Autowired
    private SpeechToText stt;

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
            System.out.println("Received audio file: " + audio.getOriginalFilename());
            // String script = stt.convertTranscript(audio);
            File inFile = File.createTempFile("User", ".webm");
            audio.transferTo(inFile);
            String script =  stt.convertTranscript(inFile);
            String response = "";
            inFile.delete();

            if (timestamp != null && !timestamp.isEmpty())
            {
               response = "User has asked a question at " + timestamp + ": \n" + script;
            }
            else
            {
                response = script;
            }

            String aiResponse = ai.respondToUser(response);
            System.out.println("AI Response: " + aiResponse);
            

            return ResponseEntity.ok(Map.of(
                "script", script,
                "response", aiResponse
            ));
        }
        catch (Exception e)
        {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    

    

}
