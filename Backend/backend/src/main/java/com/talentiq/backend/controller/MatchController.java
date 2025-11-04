package com.talentiq.backend.controller;

import com.talentiq.backend.dto.MatchRequest;
import com.talentiq.backend.dto.MatchResponse;
import com.talentiq.backend.model.User;
import com.talentiq.backend.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/match")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @PostMapping("/save")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<MatchResponse> saveMatch(
            @Valid @RequestBody MatchRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.saveMatch(request, user));
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<MatchResponse>> getUserMatches(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(matchService.getUserMatches(user));
    }

    // NEW: Delete match endpoint
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<Void> deleteMatch(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        matchService.deleteMatch(id, user);
        return ResponseEntity.ok().build();
    }
}