package com.borrowbay.response;

import com.borrowbay.domain.USER_ROLE;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String jwt;
    private String message;
    private Boolean success;
    private USER_ROLE role;
    private Boolean isAdmin;
}