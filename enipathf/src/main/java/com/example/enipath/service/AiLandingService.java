package com.example.enipath.service;

import com.example.enipath.model.client.AiProvider;
import com.example.enipath.Config.AiLandingProperties;
import com.example.enipath.dto.*;
import com.example.enipath.model.exception.AiLandingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiLandingService {

    private final AiProvider ai;
    private final OcrService ocr;
    private final AiLandingProperties props;
    private final ObjectMapper mapper;

    public AiLandingService(AiProvider ai, OcrService ocr, AiLandingProperties props,
                            @Qualifier("aiLandingObjectMapper") ObjectMapper mapper) {
        this.ai = ai;
        this.ocr = ocr;
        this.props = props;
        this.mapper = mapper;
    }

    public SpeechResponseDto answerQuestion(SpeechRequestDto req) {
        String system = "You are a concise, factual assistant. Answer clearly in 3-6 sentences.";
        String answer = ai.complete(system, req.transcript());
        return new SpeechResponseDto(answer.trim(), props.getGroq().getModel());
    }

    public OcrResponseDto extractAndSummarize(MultipartFile image) {
        String extracted = ocr.extractText(image);
        String system = "You are a precise summarizer. Produce clear, structured study notes.";
        String user = String.format("Summarize the following OCR-extracted text into well-structured notes.\n" +
                "Use short bullet-like sentences and keep all key facts.\n\n" +
                "TEXT:\n%s\n", extracted);
        String summary = ai.complete(system, user).trim();
        return new OcrResponseDto(extracted, summary, extracted.length());
    }

    public QuizResponseDto generateQuiz(QuizRequestDto req) {
        String system = "You generate multiple-choice quizzes.\n" +
                "Return STRICT JSON only, matching this schema exactly:\n" +
                "{\n" +
                "  \"topic\": \"string\",\n" +
                "  \"questions\": [\n" +
                "    {\n" +
                "      \"question\": \"string\",\n" +
                "      \"options\": [\"string\",\"string\",\"string\",\"string\"],\n" +
                "      \"correctIndex\": 0,\n" +
                "      \"explanation\": \"string\"\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                "Every question must have exactly 4 options. correctIndex must be 0..3.\n";
        String user = String.format("Generate %d quiz questions from this text:%n%n%s", req.numQuestions(), req.sourceText());

        String json = ai.completeJson(system, user);
        return parseQuiz(json);
    }

    private QuizResponseDto parseQuiz(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            String topic = root.path("topic").asText("Generated Quiz");
            List<QuizQuestionDto> questions = new ArrayList<>();
            for (JsonNode q : root.path("questions")) {
                List<String> options = new ArrayList<>();
                q.path("options").forEach(o -> options.add(o.asText()));
                if (options.size() != 4) continue;
                int correct = q.path("correctIndex").asInt(0);
                if (correct < 0 || correct > 3) correct = 0;
                questions.add(new QuizQuestionDto(
                        q.path("question").asText(),
                        options,
                        correct,
                        q.path("explanation").asText("")
                ));
            }
            if (questions.isEmpty()) throw new AiLandingException("No valid quiz questions generated.");
            return new QuizResponseDto(topic, questions);
        } catch (AiLandingException e) {
            throw e;
        } catch (Exception e) {
            throw new AiLandingException("Failed to parse quiz JSON: " + e.getMessage(), e);
        }
    }
}
