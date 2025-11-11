package com.talentiq.backend.exception;

public class EmailNotVerifiedException extends RuntimeException {
    private String email;

    public EmailNotVerifiedException(String message, String email) {
        super(message);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}