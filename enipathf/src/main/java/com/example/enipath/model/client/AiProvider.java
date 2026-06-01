package com.example.enipath.model.client;

public interface AiProvider {
    String complete(String systemPrompt, String userPrompt);
    String completeJson(String systemPrompt, String userPrompt);
}
