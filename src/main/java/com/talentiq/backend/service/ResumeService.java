package com.talentiq.backend.service;

import com.talentiq.backend.dto.ResumeResponse;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // Upload resume with actual file
    public ResumeResponse uploadResume(MultipartFile file, User user) {
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        // Store file and get path
        String filePath = fileStorageService.storeFile(file);

        // Create resume record
        Resume resume = new Resume();
        resume.setFilename(file.getOriginalFilename());
        resume.setFilePath(filePath);
        resume.setFileSize(file.getSize());
        resume.setMimeType(file.getContentType());
        resume.setUser(user);

        resume = resumeRepository.save(resume);

        return convertToResponse(resume);
    }

    // Get user's resumes
    public List<ResumeResponse> getUserResumes(User user) {
        List<Resume> resumes = resumeRepository.findByUserId(user.getId());
        return resumes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Delete resume
    public void deleteResume(Long resumeId, User user) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Check ownership
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this resume");
        }

        // Delete file from disk
        if (resume.getFilePath() != null) {
            fileStorageService.deleteFile(resume.getFilePath());
        }

        // Delete database record
        resumeRepository.delete(resume);
    }

    // Helper method to convert Resume to ResumeResponse
    private ResumeResponse convertToResponse(Resume resume) {
        return new ResumeResponse(
                resume.getId(),
                resume.getFilename(),
                resume.getFilePath(),
                resume.getFileSize(),
                resume.getMimeType(),
                resume.getUploadedAt(),
                resume.getUser().getId()
        );
    }
}