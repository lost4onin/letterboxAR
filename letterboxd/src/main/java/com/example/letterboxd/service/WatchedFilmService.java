package com.example.letterboxd.service;

import com.example.letterboxd.model.Movie;
import com.example.letterboxd.model.User;
import com.example.letterboxd.model.WatchedFilm;
import com.example.letterboxd.repository.MovieRepository;
import com.example.letterboxd.repository.UserRepository;
import com.example.letterboxd.repository.WatchedFilmRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class WatchedFilmService {

    private final WatchedFilmRepository watchedFilmRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public WatchedFilmService(WatchedFilmRepository watchedFilmRepository,
                              UserRepository userRepository,
                              MovieRepository movieRepository) {
        this.watchedFilmRepository = watchedFilmRepository;
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    public List<WatchedFilm> getWatchedFilmsByUser(Long userId) {
        return watchedFilmRepository.findByUserId(userId);
    }

    @Transactional
    public Optional<WatchedFilm> addWatchedFilm(Long userId, String movieTitle,
                                                String review, Double rating,
                                                String watchedDate) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Movie> movieOpt = movieRepository.findFirstByTitleIgnoreCase(movieTitle);

        if (userOpt.isPresent() && movieOpt.isPresent()) {
            User user = userOpt.get();
            Movie movie = movieOpt.get();

            // Retrait automatique de la watchlist si le film y est présent
            if (user.getWatchlist().contains(movie)) {
                user.getWatchlist().remove(movie);
                userRepository.save(user);
            }

            LocalDate date = (watchedDate != null)
                    ? LocalDate.parse(watchedDate, FORMATTER)
                    : LocalDate.now();

            WatchedFilm watchedFilm = new WatchedFilm(user, movie, review, rating, date);
            return Optional.of(watchedFilmRepository.save(watchedFilm));
        }
        return Optional.empty();
    }
}