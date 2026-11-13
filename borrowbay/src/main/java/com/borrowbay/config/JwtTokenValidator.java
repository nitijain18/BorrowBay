package com.borrowbay.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import javax.crypto.SecretKey;

public class JwtTokenValidator extends OncePerRequestFilter {

    // Skip JWT validation for these public endpoints
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/users/login")
            || path.equals("/users/signup")
            || path.startsWith("/otp/")
            || path.startsWith("/items")
            || path.startsWith("/categories")
            || path.startsWith("/subcategories")
            || path.equals("/razorpay/verify");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = request.getHeader(JWT_CONSTANT.JWT_HEADER);

        if (jwt != null && jwt.startsWith("Bearer ")) {
            jwt = jwt.substring(7);

            try {
                SecretKey key = Keys.hmacShaKeyFor(
                        JWT_CONSTANT.SECRET_KEY.getBytes());

                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(jwt)
                        .getPayload();

                String email = String.valueOf(claims.get("email"));
                String role  = String.valueOf(claims.get("role"));

                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority(role));

                Authentication authentication =
                        new UsernamePasswordAuthenticationToken(
                                email, null, authorities);

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}