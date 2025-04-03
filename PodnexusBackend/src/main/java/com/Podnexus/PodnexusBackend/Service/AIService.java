package com.Podnexus.PodnexusBackend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Podnexus.PodnexusBackend.Model.TranscriptSegment;

import java.util.Vector;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
// import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.vectorstore.VectorStore;




@Service
public class AIService 
{

    // private List<TranscriptSegment> storedTranscript;
    private String storedTranscript;

    @Autowired
    private OllamaChatModel client;


    public AIService(OllamaChatModel client)
    {
        this.client = client;
    }


    public String processTranscript(String transcript)
    {
        String sysPrompt = """
                 Suppose you are Andrew(Conversational, Energetic), the host of this podcast. The transcript of the podcast is given to you.
            Your job is to answer any user questions or have a conversation based on it.
            Provide informative and friendly responses as if you are the podcast host. Be human and speak natural/conversational. Feel free to study about the host itself. No need to do introduction as the video will be played. You will be summoned when the user asks a question.
                """;
        // StringBuilder builder = new StringBuilder();
        // for(TranscriptSegment segment: transcript)
        // {
        //     builder.append(segment.speaker).append(": ").append(segment.text).append("\n");
        // }
        storedTranscript = transcript;
        return client.call("Here is the transcript: " + transcript + "\\n" +  "\\n" + sysPrompt);
    }

    public String respondToUser(String userResponse)
    {
        
        if (storedTranscript.isEmpty())
        {
            return "No transcript available. Provide the youtube link first.";
        }
        // Map<String, StringBuilder> transcriptFormat = new HashMap<>();
        // for (TranscriptSegment segment: storedTranscript)
        // {
        //     transcriptFormat.computeIfAbsent(segment.speaker, s -> new StringBuilder()).append(segment.text).append(" ");
        // }
        
        // Map<String,String> speakers = Map.of(
        //     "SPEAKER_00", "Andrew",
        //     "SPEAKER_01", "Jane"
        // );

        // StringBuilder backgroundContext = new StringBuilder();
        // for(Map.Entry<String,StringBuilder> entry : transcriptFormat.entrySet())
        // {
        //     String name = speakers.getOrDefault(entry.getKey(), entry.getKey());
        //     backgroundContext.append(name).append(": ").append(entry.getValue()).append("\n");
        // }

        String prompt = """
                Use the following transcript of their conversation to guide your response. Keep it casual, insightful, and human — like you're part of the show.
                Remember, you're Andrew, the host of this podcast.
                Your job is to answer any user questions or have a conversation based on it.
                Provide informative and friendly responses as if you are the podcast host. Be human and speak natural/conversational. Don't make it too lengthy but make it short and concise. No need to do introduction as the video will be played.

                Transcript:
                %s

                Listener says: "%s"

                Respond as if you're continuing the podcast:
                """.formatted(storedTranscript, userResponse);
        return client.call(prompt);
    }

    

}
