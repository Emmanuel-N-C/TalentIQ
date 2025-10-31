package com.talentiq.backend.service;

import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ResumeParserService {

    private final Tika tika = new Tika();

    /**
     * Extract text from a resume file (PDF, DOCX, DOC)
     * @param filePath - Path to the resume file
     * @return Extracted text content
     */
    public String extractText(String filePath) {
        try {
            Path path = Paths.get(filePath);
            File file = path.toFile();

            if (!file.exists()) {
                throw new RuntimeException("File not found: " + filePath);
            }

            // Use Tika to extract text
            String extractedText = tika.parseToString(file);

            // Clean up the extracted text
            return cleanText(extractedText);

        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + filePath, e);
        } catch (TikaException e) {
            throw new RuntimeException("Failed to parse file: " + filePath, e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error while parsing file: " + filePath, e);
        }
    }

    /**
     * Extract text from an InputStream (alternative method)
     * @param inputStream - Input stream of the file
     * @param filename - Original filename for context
     * @return Extracted text content
     */
    public String extractTextFromStream(InputStream inputStream, String filename) {
        try {
            String extractedText = tika.parseToString(inputStream);
            return cleanText(extractedText);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read stream for file: " + filename, e);
        } catch (TikaException e) {
            throw new RuntimeException("Failed to parse file: " + filename, e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error while parsing file: " + filename, e);
        }
    }

    /**
     * Clean extracted text by removing extra whitespace and normalizing line breaks
     * @param text - Raw extracted text
     * @return Cleaned text
     */
    private String cleanText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        // Remove excessive whitespace
        text = text.trim();

        // Normalize line breaks
        text = text.replaceAll("\\r\\n", "\n");
        text = text.replaceAll("\\r", "\n");

        // Remove multiple consecutive blank lines
        text = text.replaceAll("\n{3,}", "\n\n");

        // Remove excessive spaces
        text = text.replaceAll(" {2,}", " ");

        return text;
    }

    /**
     * Detect the MIME type of a file
     * @param filePath - Path to the file
     * @return MIME type (e.g., "application/pdf")
     */
    public String detectMimeType(String filePath) {
        try {
            Path path = Paths.get(filePath);
            return tika.detect(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to detect MIME type for: " + filePath, e);
        }
    }

    /**
     * Validate if a file can be parsed
     * @param filePath - Path to the file
     * @return true if file is parseable, false otherwise
     */
    public boolean isParseable(String filePath) {
        try {
            String mimeType = detectMimeType(filePath);
            return mimeType.equals("application/pdf") ||
                    mimeType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                    mimeType.equals("application/msword");
        } catch (Exception e) {
            return false;
        }
    }
}