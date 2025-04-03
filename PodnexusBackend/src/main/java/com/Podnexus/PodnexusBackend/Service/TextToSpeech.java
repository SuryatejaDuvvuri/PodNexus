package com.Podnexus.PodnexusBackend.Service;

import org.springframework.stereotype.Service;
import kong.unirest.Unirest;
import kong.unirest.HttpResponse;
import kong.unirest.json.JSONObject;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
// import com.sun.speech.freetts.VoiceManager;
// import com.sun.speech.freetts.audio.AudioPlayer;
// import com.sun.speech.freetts.audio.SingleFileAudioPlayer;
// import javax.sound.sampled.AudioFileFormat;


import org.springframework.stereotype.Service;

@Service
public class TextToSpeech 
{
    private Path audioPath;
    // private Voice voice;
    private static final String API_KEY = "";
    private static final String API_URL = "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128";


    public TextToSpeech()
    {
        this.audioPath = Paths.get("audio-files");
        try
        {
            if(!Files.exists(this.audioPath))
            {
                Files.createDirectories(this.audioPath);
            }
            // System.setProperty("freetts.voices", "com.sun.speech.freetts.en.us.cmu_us_kal.KevinVoiceDirectory");
            // VoiceManager voiceManager = VoiceManager.getInstance();
            // voice = voiceManager.getVoice("kevin16");
            // if(voice == null)
            // {
            //     System.err.println("Voice not found");
            // }
            // else
            // {
            //     voice.allocate();
            //     voice.setRate(150);
            //     voice.setPitch(100);
            //     voice.setVolume(3.0f);
            // }
        }
        catch(Exception e)
        {
            throw new RuntimeException("Could not retrieve files.");    
        }
        
    }

    public String convertToSpeech(String text)
    {
        try
        {
            JSONObject requestBody = new JSONObject();
            requestBody.put("text", text);
            requestBody.put("model_id", "eleven_multilingual_v2");
            
            kong.unirest.HttpResponse<byte[]> response = Unirest.post(API_URL)
            .header("xi-api-key", API_KEY)
            .header("Content-Type", "application/json")
            .body(requestBody)
            .asBytes();

            if (response.getStatus() == 200) 
            {
                Path output = audioPath.resolve("output.mp3");
                Files.write(output, response.getBody());
                return "output.mp3";
            } else 
            {
                String errorBody = new String(response.getBody());
                System.out.println("Error Body: " + errorBody);
                throw new RuntimeException("API request failed with status: " + response.getStatus());
            }
            // System.out.println("Audio file created at: " + output.toString());
            // return "output.aiff";
        }
        catch(Exception e)
        {
            e.printStackTrace();
            return "Error converting text to speech " + e;
        }
    }
}
