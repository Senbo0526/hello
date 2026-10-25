package com.example.trello.dto;

import lombok.Data;

import java.util.List;

@Data
public class ColumnDto {
    private Long id;
    private String title;
    private Integer position;
    private List<CardDto> cards;
}
