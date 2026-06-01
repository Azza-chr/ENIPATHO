package com.example.enipath.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SpeechRequestDto(
        @NotBlank @Size(max = 4000) String transcript
) {}
