package com.talentiq.backend.service;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class ResumeParserService {

    private final Tika tika = new Tika();

    /**
     * Extract text from resume file (PDF, DOCX, TXT, etc.)
     * Uses Apache Tika for automatic format detection and parsing
     */
    public String extractText(String filePath) {
        try {
            File file = new File(filePath);

            if (!file.exists()) {
                throw new RuntimeException("File not found: " + filePath);
            }

            // Tika automatically detects file type and extracts text
            String extractedText = tika.parseToString(file);

            // Clean up the text
            extractedText = cleanExtractedText(extractedText);

            System.out.println("✅ Successfully extracted text from: " + filePath);
            System.out.println("📝 Extracted text length: " + extractedText.length() + " characters");

            return extractedText;

        } catch (IOException | TikaException e) {
            System.err.println("❌ Error extracting text from: " + filePath);
            e.printStackTrace();
            throw new RuntimeException("Failed to extract text from resume: " + e.getMessage(), e);
        }
    }

    /**
     * Clean extracted text - remove excessive whitespace, special characters, etc.
     */
    private String cleanExtractedText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        // Remove excessive whitespace
        text = text.replaceAll("\\s+", " ");

        // Remove special control characters
        text = text.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");

        // Trim
        text = text.trim();

        return text;
    }

    /**
     * Validate if file is a supported resume format
     */
    public boolean isSupportedFormat(String filename) {
        if (filename == null) {
            return false;
        }

        String lowerCaseFilename = filename.toLowerCase();
        return lowerCaseFilename.endsWith(".pdf") ||
                lowerCaseFilename.endsWith(".docx") ||
                lowerCaseFilename.endsWith(".doc") ||
                lowerCaseFilename.endsWith(".txt");
    }
}