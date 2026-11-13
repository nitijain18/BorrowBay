package com.borrowbay.config;

import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtProvider {

    private SecretKey key = Keys.hmacShaKeyFor(JWT_CONSTANT.SECRET_KEY.getBytes());

    public String generateToken(Authentication auth) {

        String roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.equals("ADMIN"))
                .findFirst()
                .orElse("ROLE_CUSTOMER");

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));

        return Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + 604800000L))
                .claim("email", auth.getName())
                .claim("role", roles)
                .claim("isAdmin", isAdmin)
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String jwt) {
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
        return String.valueOf(claims.get("email"));
    }

    public Boolean getIsAdminFromToken(String jwt) {
        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);
        }
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
        Object isAdmin = claims.get("isAdmin");
        return isAdmin != null && (Boolean) isAdmin;
    }
}