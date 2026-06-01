package com.example.enipath.model.client;

import com.example.enipath.Config.AiLandingProperties;
import com.example.enipath.model.exception.AiLandingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class GroqAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GroqAiProvider.class);

    private final RestClient restClient;
    private final AiLandingProperties props;
    private final ObjectMapper mapper;

    public GroqAiProvider(@Qualifier("aiLandingRestClient") RestClient restClient,
                          AiLandingProperties props,
                          @Qualifier("aiLandingObjectMapper") ObjectMapper mapper) {
        this.restClient = restClient;
        this.props = props;
        this.mapper = mapper;
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        return callChat(systemPrompt, userPrompt, false);
    }

    @Override
    public String completeJson(String systemPrompt, String userPrompt) {
        return callChat(systemPrompt, userPrompt, true);
    }

    private String callChat(String systemPrompt, String userPrompt, boolean jsonMode) {
        if (props.getGroq().getApiKey() == null || props.getGroq().getApiKey().isBlank()) {
            throw new AiLandingException("Groq API key not configured. Set GROQ_API_KEY environment variable.");
        }

        Map<String, Object> body = Map.of(
                "model", props.getGroq().getModel(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", jsonMode ? 0.2 : 0.7,
                "response_format", jsonMode ? Map.of("type", "json_object") : Map.of("type", "text")
        );

        int attempts = 0;
        long backoff = 500L;
        RuntimeException lastError = null;

        while (attempts < props.getGroq().getMaxRetries()) {
            attempts++;
            try {
                String raw = restClient.post()
                        .uri("/chat/completions")
                        .body(body)
                        .retrieve()
                        .body(String.class);

                if (raw == null) throw new AiLandingException("Empty response body from AI provider.");

                JsonNode root = mapper.readTree(raw);
                JsonNode content = root.path("choices").path(0).path("message").path("content");
                if (content.isMissingNode() || content.asText().isBlank()) {
                    throw new AiLandingException("Empty AI response content.");
                }
                return content.asText();
            } catch (Exception e) {
                lastError = new AiLandingException("AI call failed: " + e.getMessage(), e);
                log.warn("Groq attempt {}/{} failed: {}", attempts, props.getGroq().getMaxRetries(), e.getMessage());
                try { Thread.sleep(backoff); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); break; }
                backoff *= 2;
            }
        }
        throw lastError != null ? lastError : new AiLandingException("AI call failed after retries.");
    }
}
