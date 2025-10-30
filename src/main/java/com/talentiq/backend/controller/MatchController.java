package com.talentiq.backend.controller;

import com.talentiq.backend.dto.MatchRequest;
import com.talentiq.backend.model.Match;
import com.talentiq.backend.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/match")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {

    @Autowired
    private MatchService matchService;

    @PostMapping("/save")
    public ResponseEntity<Match> saveMatch(@Valid @RequestBody MatchRequest request) {
        return ResponseEntity.ok(matchService.saveMatch(request));
    }
}