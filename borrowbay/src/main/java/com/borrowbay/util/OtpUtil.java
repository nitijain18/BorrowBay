package com.borrowbay.util;

import java.util.Random;

public class OtpUtil {

    // Generates a random 6-digit number as String
    // e.g. "847291", "003847", "123456"
    public static String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        // 100000 + random(0 to 899999) = always 6 digits
        return String.valueOf(otp);
    }
}