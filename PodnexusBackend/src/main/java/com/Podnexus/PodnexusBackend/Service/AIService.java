package com.Podnexus.PodnexusBackend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Vector;
import java.util.List;
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
                 Suppose you are the host of this podcast. The transcript of the show is given to you.
            Your job is to answer any user questions or have a conversation based on it.
            Provide informative and friendly responses as if you are the podcast host. Be human and speak natural/conversational. Feel free to study about the host itself. No need to do introduction as the video will be played. You will be summoned when the user asks a question.
                """;
        // List<String> parts = List.of(transcript.split("(?<=\\G..{1000})"));
        // List<Document> vectors = parts.stream()
        // .map(part -> new Document(part)).toList();
        // List<String> chunks = vectors.stream()
        // .map(doc -> doc.getText())
        // .toList();
        // List<float[]> vectorList = embeddingModel.embed(chunks);
        storedTranscript = transcript;
        return client.call("Here is the transcript: " + transcript + "\\n" +  "\\n" + sysPrompt);
    }

    public String respondToUser(String userResponse)
    {
        // List<Document> vectors = db.similaritySearch(userResponse);
        // String transcript = vectors.stream().map(Document::getText).collect(Collectors.joining("\n"));
        System.out.println(userResponse);
        if (storedTranscript.isEmpty())
        {
            return "No transcript available. Provide the youtube link first.";
        }
        String prompt = """
            You are the host of the following podcast. Based on the transcript below, respond naturally to the listener's comment as if you were continuing the podcast. Be informal, natural, and conversational. You are not summarizing. You're reacting like you're in the moment. Don't beat around the bush. Just answer the question directly.

            Transcript:
            """ + storedTranscript + "\n\nListener says: \"" + userResponse + "\"\n\nRespond as if you're continuing the episode:";

        return client.call(prompt);
    }

    

}
