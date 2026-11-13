package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.borrowbay.config.JwtProvider;
import com.borrowbay.domain.USER_ROLE;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.User;
import com.borrowbay.repository.UserRepository;
import com.borrowbay.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final CustomUserServiceImpl customUserService;

    @Override
    public User createUser(User req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BorrowBayException("Email already in use");
        }
        req.setRole(USER_ROLE.ROLE_CUSTOMER);
        req.setCreatedAt(LocalDateTime.now());
        req.setPassword(passwordEncoder.encode(req.getPassword()));
        return userRepository.save(req);
    }

    @Override
    public String login(String email, String password) {
        UserDetails userDetails = customUserService.loadUserByUsername(email);

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BorrowBayException("Invalid email or password");
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );

        return jwtProvider.generateToken(authentication);
    }

    @Override
    public User getUserFromToken(String jwt) {
        String email = jwtProvider.getEmailFromToken(jwt);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BorrowBayException("User not found"));
    }

    @Override
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("User not found with id " + id));
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BorrowBayException("User not found with email " + email));
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public List<User> findByRole(USER_ROLE role) {
        return userRepository.findByRole(role);
    }

    @Override
    public User updateUser(Long id, User req) {
        User user = findById(id);
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        if (req.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        user.setPhoneNumber(req.getPhoneNumber());
        user.setProfileImage(req.getProfileImage());
        user.setRole(req.getRole());
        return userRepository.save(user);
    }

    @Override
    public User patchUser(Long id, User req) {
        User user = findById(id);
        if (req.getFirstName() != null)    user.setFirstName(req.getFirstName());
        if (req.getLastName() != null)     user.setLastName(req.getLastName());
        if (req.getEmail() != null)        user.setEmail(req.getEmail());
        if (req.getPassword() != null)     user.setPassword(passwordEncoder.encode(req.getPassword()));
        if (req.getPhoneNumber() != null)  user.setPhoneNumber(req.getPhoneNumber());
        if (req.getProfileImage() != null) user.setProfileImage(req.getProfileImage());
        if (req.getRole() != null)         user.setRole(req.getRole());
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(Long id) {
        User user = findById(id);
        userRepository.delete(user);
    }
}