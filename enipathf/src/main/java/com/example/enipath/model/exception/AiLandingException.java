package com.example.enipath.model.exception;

public class AiLandingException extends RuntimeException {
    public AiLandingException(String msg) { super(msg); }
    public AiLandingException(String msg, Throwable cause) { super(msg, cause); }
}
