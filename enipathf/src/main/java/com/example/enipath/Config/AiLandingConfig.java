package com.example.enipath.Config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(AiLandingProperties.class)
@ConditionalOnProperty(prefix = "ai.landing", name = "enabled", havingValue = "true", matchIfMissing = true)
public class AiLandingConfig implements WebMvcConfigurer {

    private final AiLandingProperties props;

    public AiLandingConfig(AiLandingProperties props) {
        this.props = props;
    }

    @Bean(name = "aiLandingRestClient")
    public RestClient aiLandingRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(props.getGroq().getTimeoutMs()));
        factory.setReadTimeout(Duration.ofMillis(props.getGroq().getTimeoutMs()));
        return RestClient.builder()
                .baseUrl(props.getGroq().getBaseUrl())
                .requestFactory(factory)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Authorization", "Bearer " + props.getGroq().getApiKey())
                .build();
    }

    @Bean(name = "aiLandingObjectMapper")
    public ObjectMapper aiLandingObjectMapper() {
        return new ObjectMapper();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/ai-landing/**")
                .allowedOrigins(props.getCors().getAllowedOrigins().toArray(new String[0]))
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}
