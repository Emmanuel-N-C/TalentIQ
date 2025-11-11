package com.talentiq.backend.repository;

import com.talentiq.backend.model.Role;
import com.talentiq.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByPasswordResetToken(String token);

    // Count methods for admin statistics
    long countByRole(Role role);
}