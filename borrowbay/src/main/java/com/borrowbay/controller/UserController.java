package com.borrowbay.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.borrowbay.domain.USER_ROLE;
import com.borrowbay.model.User;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.response.AuthResponse;
import com.borrowbay.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ── PUBLIC ──────────────────────────────────────

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody User req) {
        return ResponseEntity.ok(userService.createUser(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody User req) {
        String token = userService.login(req.getEmail(), req.getPassword());
        User user = userService.findByEmail(req.getEmail());

        AuthResponse response = new AuthResponse();
        response.setJwt(token);
        response.setMessage("Login successful");
        response.setSuccess(true);
        response.setRole(user.getRole());

        return ResponseEntity.ok(response);
    }

    // ── PROTECTED ────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<User> getMyProfile(
            @RequestHeader("Authorization") String jwt) {
        return ResponseEntity.ok(userService.getUserFromToken(jwt));
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable USER_ROLE role) {
        return ResponseEntity.ok(userService.findByRole(role));
    }

    // ← /{id} MUST come last — otherwise it catches /login, /profile etc.
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @RequestBody User req) {
        return ResponseEntity.ok(userService.updateUser(id, req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<User> patchUser(@PathVariable Long id,
                                          @RequestBody User req) {
        return ResponseEntity.ok(userService.patchUser(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new ApiResponse("User deleted successfully", true));
    }
}