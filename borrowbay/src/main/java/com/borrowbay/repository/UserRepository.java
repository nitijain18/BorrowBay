package com.borrowbay.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.User;
import com.borrowbay.domain.USER_ROLE;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(USER_ROLE role);
}