package com.borrowbay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BorrowbayApplication {
    public static void main(String[] args) {
        SpringApplication.run(BorrowbayApplication.class, args);
    }
}