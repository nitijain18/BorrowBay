package com.borrowbay.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RazorpayOrderRequest {
    private Long orderId;      // your BorrowBay order id
    private Double amount;     // total amount in rupees
}