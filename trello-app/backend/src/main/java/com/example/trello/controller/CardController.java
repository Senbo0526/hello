package com.example.trello.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CardController {

    @PostMapping("/columns/{columnId}/cards")
    public ResponseEntity<Map<String, Object>> createCard(
            @PathVariable Long columnId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of(
                "id", 1,
                "column_id", columnId,
                "title", body.getOrDefault("title", ""),
                "position", 0
        ));
    }

    @PutMapping("/cards/{id}")
    public ResponseEntity<Void> updateCard(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok().build();
    }

    @PutMapping("/cards/{id}/move")
    public ResponseEntity<Void> moveCard(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
