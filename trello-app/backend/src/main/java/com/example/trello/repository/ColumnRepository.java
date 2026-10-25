package com.example.trello.repository;

import com.example.trello.entity.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ColumnRepository extends JpaRepository<BoardColumn, Long> {
}
