package com.Podnexus.PodnexusBackend.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SpeechToText 
{

    
    public String convertTranscript(MultipartFile audio)
    {
        try
        {
            File inFile = File.createTempFile("One", ".mp3");
            audio.transferTo(inFile);

            ProcessBuilder pb = new ProcessBuilder("whisper", inFile.getAbsolutePath(), "--model", "base", "--output_format", "txt");
            Process p = pb.start();
            BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line = "";
            while ((line = br.readLine()) != null)
            {
                sb.append(line).append("\n");
            }

            inFile.delete();
            return sb.toString().trim();
        }
        catch(IOException e)
        {
            e.printStackTrace();
            return "Error transcribing audio " + e;
        }
    }

    public String processDiarization(MultipartFile audio)
    {
       try
       {
            File audioFile = File.createTempFile("audio", ".mp3");
            audio.transferTo(audioFile);
            ProcessBuilder pb = new ProcessBuilder("python3", "diarize.py", audioFile.getAbsolutePath());
            pb.redirectErrorStream(true);
            Process p = pb.start();

            try(BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream())))
            {
                return br.lines().collect(Collectors.joining("\n"));
            }
       }
       catch(IOException e)
       {
            e.printStackTrace();
            return "Error identifying speakers. " + e;
       }
    }
}
