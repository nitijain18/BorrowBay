package com.borrowbay.config;

public class JWT_CONSTANT {

    // This secret key is used to SIGN tokens when creating them
    // and to VERIFY tokens when reading them
    // Must be long and random — anyone who knows this can forge tokens
    public static final String SECRET_KEY =
        "borrowBaySecretKeyForJwtTokenGenerationAndValidation2025BorrowBay";

    // The HTTP header name where the token is sent
    // Every request will have: Authorization: Bearer eyJhbGci...
    public static final String JWT_HEADER = "Authorization";
}