package com.example.letterboxd.repository;

import com.example.letterboxd.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByTitleIgnoreCase(String title);
}