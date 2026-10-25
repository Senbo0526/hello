package com.example.trello.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/columns")
public class ColumnController {

    @GetMapping
    public List<Object> getColumns() {
        return List.of();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createColumn(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of(
                "id", 1,
                "title", body.getOrDefault("title", ""),
                "position", 0
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateColumn(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/position")
    public ResponseEntity<Void> updateColumnPosition(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
