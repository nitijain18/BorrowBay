package com.borrowbay.service;

import java.util.List;

import com.borrowbay.domain.USER_ROLE;
import com.borrowbay.model.User;

public interface UserService {
    User createUser(User req);
    String login(String email, String password);
    User getUserFromToken(String jwt);
    User findById(Long id);
    User findByEmail(String email);
    List<User> findAll();
    List<User> findByRole(USER_ROLE role);
    User updateUser(Long id, User req);
    User patchUser(Long id, User req);
    void deleteUser(Long id);
}