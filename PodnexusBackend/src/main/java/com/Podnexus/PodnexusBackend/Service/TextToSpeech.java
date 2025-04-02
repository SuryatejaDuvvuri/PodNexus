package com.Podnexus.PodnexusBackend.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import com.sun.speech.freetts.Voice;
import com.sun.speech.freetts.VoiceManager;
import com.sun.speech.freetts.audio.AudioPlayer;
import com.sun.speech.freetts.audio.SingleFileAudioPlayer;
import javax.sound.sampled.AudioFileFormat;


import org.springframework.stereotype.Service;

@Service
public class TextToSpeech 
{
    private Path audioPath;
    private Voice voice;
    public TextToSpeech()
    {
        this.audioPath = Paths.get("audio-files");
        try
        {
            if(audioPath.toFile().exists() == false)
            {
                Files.createDirectories(this.audioPath);
            }
            System.setProperty("freetts.voices", "com.sun.speech.freetts.en.us.cmu_us_kal.KevinVoiceDirectory");
            VoiceManager voiceManager = VoiceManager.getInstance();
            voice = voiceManager.getVoice("kevin16");
            if(voice == null)
            {
                System.err.println("Voice not found");
            }
            else
            {
                voice.allocate();
                voice.setRate(150);
                voice.setPitch(100);
                voice.setVolume(3.0f);
            }
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
            Path output = audioPath.resolve("output.aiff");
            AudioPlayer player = new SingleFileAudioPlayer(output.toString(), AudioFileFormat.Type.WAVE);
            voice.setAudioPlayer(player);
            voice.speak(text);
            player.close();
            System.out.println("Audio file created at: " + output.toString());
            return "output.aiff";
        }
        catch(Exception e)
        {
            e.printStackTrace();
            return "Error converting text to speech " + e;
        }
    }
}
