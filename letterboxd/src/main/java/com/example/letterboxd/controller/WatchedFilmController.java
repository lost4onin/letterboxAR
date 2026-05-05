package com.example.letterboxd.controller;

import com.example.letterboxd.model.WatchedFilm;
import com.example.letterboxd.service.WatchedFilmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users/{userId}/watchedfilms")
public class WatchedFilmController {

    private final WatchedFilmService watchedFilmService;

    public WatchedFilmController(WatchedFilmService watchedFilmService) {
        this.watchedFilmService = watchedFilmService;
    }

    @GetMapping
    public List<WatchedFilm> getWatchedFilms(@PathVariable Long userId) {
        return watchedFilmService.getWatchedFilmsByUser(userId);
    }

    // PUT /users/{userId}/watchedfilms?movieTitle=Inception
    // Body JSON : { "review": "Excellent film", "rating": 4.5, "watchedDate": "03/05/2026" }
    @PutMapping
    public ResponseEntity<WatchedFilm> addWatchedFilm(
            @PathVariable Long userId,
            @RequestParam String movieTitle,
            @RequestBody Map<String, Object> body) {

        String review = (String) body.get("review");
        Double rating = body.get("rating") != null
                ? Double.valueOf(body.get("rating").toString())
                : null;
        String watchedDate = (String) body.get("watchedDate");

        return watchedFilmService.addWatchedFilm(userId, movieTitle, review, rating, watchedDate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}