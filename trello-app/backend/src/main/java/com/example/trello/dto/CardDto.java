package com.example.trello.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CardDto {
    private Long id;
    private Long columnId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String priority;
    private Integer position;
}
