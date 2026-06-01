package com.example.enipath.Config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Validated
@ConfigurationProperties(prefix = "ai.landing")
public class AiLandingProperties {

    private boolean enabled = true;
    private Cors cors = new Cors();
    private Groq groq = new Groq();
    private Ocr ocr = new Ocr();

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean v) { this.enabled = v; }
    public Cors getCors() { return cors; }
    public void setCors(Cors v) { this.cors = v; }
    public Groq getGroq() { return groq; }
    public void setGroq(Groq v) { this.groq = v; }
    public Ocr getOcr() { return ocr; }
    public void setOcr(Ocr v) { this.ocr = v; }

    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>(List.of("http://localhost:4200"));
        public List<String> getAllowedOrigins() { return allowedOrigins; }
        public void setAllowedOrigins(List<String> v) { this.allowedOrigins = v; }
    }

    public static class Groq {
        @NotBlank private String baseUrl = "https://api.groq.com/openai/v1";
        @NotBlank private String apiKey = "";
        @NotBlank private String model = "llama-3.3-70b-versatile";
        @Positive private int timeoutMs = 30000;
        @Positive private int maxRetries = 3;
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String v) { this.baseUrl = v; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String v) { this.apiKey = v; }
        public String getModel() { return model; }
        public void setModel(String v) { this.model = v; }
        public int getTimeoutMs() { return timeoutMs; }
        public void setTimeoutMs(int v) { this.timeoutMs = v; }
        public int getMaxRetries() { return maxRetries; }
        public void setMaxRetries(int v) { this.maxRetries = v; }
    }

    public static class Ocr {
        @NotBlank private String tessdataPath = "/usr/share/tesseract-ocr/5/tessdata";
        @NotBlank private String language = "eng";
        @Positive private long maxFileSizeBytes = 10_485_760L;
        public String getTessdataPath() { return tessdataPath; }
        public void setTessdataPath(String v) { this.tessdataPath = v; }
        public String getLanguage() { return language; }
        public void setLanguage(String v) { this.language = v; }
        public long getMaxFileSizeBytes() { return maxFileSizeBytes; }
        public void setMaxFileSizeBytes(long v) { this.maxFileSizeBytes = v; }
    }
}
