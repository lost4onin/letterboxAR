package com.example.letterboxd.repository;

import com.example.letterboxd.model.WatchedFilm;
import com.example.letterboxd.model.WatchedFilmId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WatchedFilmRepository extends JpaRepository<WatchedFilm, WatchedFilmId> {
    List<WatchedFilm> findByUserId(Long userId);
}