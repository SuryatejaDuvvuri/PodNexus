package com.Podnexus.PodnexusBackend.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.Podnexus.PodnexusBackend.Model.TranscriptSegment;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class SpeechToText 
{
    private Path audioPath;
    public SpeechToText()
    {
        this.audioPath = Paths.get("audio-files");
        try
        {
            Files.createDirectories(this.audioPath);
        }
        catch(Exception e)
        {
            throw new RuntimeException("Could not retrieve files.");    
        }
        
    }
    
    public String convertTranscript(File audio)
    {
        try
        {
            
            ProcessBuilder pb = new ProcessBuilder("whisper", audio.getAbsolutePath(), "--model", "base", "--output_format", "txt");
            Process p = pb.start();
            BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line = "";
            while ((line = br.readLine()) != null)
            {
                sb.append(line).append("\n");
            }


            return sb.toString().trim();

        }
        catch(IOException e)
        {
            e.printStackTrace();
            return "Error transcribing audio " + e;
        }
    }

    public List<TranscriptSegment> processDiarization(File inFile)
    {
       try
       {

            ProcessBuilder pb = new ProcessBuilder("python3", "src/main/java/com/Podnexus/PodnexusBackend/Service/diarize.py", inFile.getAbsolutePath());
            pb.redirectErrorStream(true);
            Process p = pb.start();

            try(BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream())))
            {
                // return br.lines().collect(Collectors.joining("\n"));
                String line = br.lines()
                .filter(l -> l.trim().startsWith("["))
                .findFirst()
                .orElse("");

                if (line.isEmpty()) {
                    System.err.println("No valid JSON output from diarization script.");
                    return List.of();
                }

                ObjectMapper objectMapper = new ObjectMapper();
                List<TranscriptSegment> segments = objectMapper.readValue(line, new TypeReference<List<TranscriptSegment>>() {});
                return segments;
            }
       }
       catch(IOException e)
       {
            e.printStackTrace();
            // return "Error identifying speakers. " + e;
            return List.of();
       }
    }
}
