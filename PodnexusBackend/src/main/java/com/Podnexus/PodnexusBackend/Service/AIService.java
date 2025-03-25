package com.Podnexus.PodnexusBackend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ai.chat.client.ChatClient;
// import org.springframework.ai.chat.model.Generation;



@Service
public class AIService 
{
    @Autowired
    private ChatClient client;


    public String processTranscript(String transcript)
    {
        String sysPrompt = """
                 Suppose you are the host of this podcast. The transcript of the show is given to you.
            Your job is to answer any user questions or have a conversation based on it.
            Provide informative and friendly responses as if you are the podcast host. Feel free to study about the host itself.
                """;

        return client
        .prompt().system(sysPrompt)
        .user("Here is the transcript: " + transcript + "\n\nWhat can you tell me about this?")
        .call().content();
    
        
    }

}
