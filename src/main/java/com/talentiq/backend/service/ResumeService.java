package com.talentiq.backend.service;

import com.talentiq.backend.dto.ResumeResponse;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    public ResumeResponse uploadResume(String filename, User user) {
        Resume resume = new Resume();
        resume.setFilename(filename);
        resume.setUser(user);
        // Later: Add file storage and text extraction logic

        resume = resumeRepository.save(resume);

        return new ResumeResponse(resume.getId(), resume.getFilename(),
                resume.getUploadedAt(), user.getId());
    }

    public List<ResumeResponse> getUserResumes(User user) {
        List<Resume> resumes = resumeRepository.findByUserId(user.getId());
        return resumes.stream()
                .map(r -> new ResumeResponse(r.getId(), r.getFilename(),
                        r.getUploadedAt(), user.getId()))
                .collect(Collectors.toList());
    }
}