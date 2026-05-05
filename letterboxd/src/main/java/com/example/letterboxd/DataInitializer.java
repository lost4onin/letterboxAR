package com.example.letterboxd;

import com.example.letterboxd.model.Movie;
import com.example.letterboxd.model.User;
import com.example.letterboxd.model.WatchedFilm;
import com.example.letterboxd.repository.MovieRepository;
import com.example.letterboxd.repository.UserRepository;
import com.example.letterboxd.repository.WatchedFilmRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final WatchedFilmRepository watchedFilmRepository;

    public DataInitializer(MovieRepository movieRepository,
                           UserRepository userRepository,
                           WatchedFilmRepository watchedFilmRepository) {
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
        this.watchedFilmRepository = watchedFilmRepository;
    }

    @Override
    public void run(String... args) {
        // ── Movies ──────────────────────────────
        List<Movie> movies = List.of(
            new Movie("Inception", "Christopher Nolan", 2010, "Sci-Fi"),
            new Movie("Interstellar", "Christopher Nolan", 2014, "Sci-Fi"),
            new Movie("The Grand Budapest Hotel", "Wes Anderson", 2014, "Comedy"),
            new Movie("Parasite", "Bong Joon-ho", 2019, "Thriller"),
            new Movie("La La Land", "Damien Chazelle", 2016, "Musical"),
            new Movie("Moonlight", "Barry Jenkins", 2016, "Drama"),
            new Movie("The Shawshank Redemption", "Frank Darabont", 1994, "Drama"),
            new Movie("Pulp Fiction", "Quentin Tarantino", 1994, "Crime"),
            new Movie("Spirited Away", "Hayao Miyazaki", 2001, "Animation"),
            new Movie("In the Mood for Love", "Wong Kar-wai", 2000, "Romance"),
            new Movie("Amélie", "Jean-Pierre Jeunet", 2001, "Comedy"),
            new Movie("Drive", "Nicolas Winding Refn", 2011, "Action"),
            new Movie("Her", "Spike Jonze", 2013, "Romance"),
            new Movie("Whiplash", "Damien Chazelle", 2014, "Drama"),
            new Movie("The Lighthouse", "Robert Eggers", 2019, "Horror"),
            new Movie("Portrait of a Lady on Fire", "Céline Sciamma", 2019, "Romance"),
            new Movie("Everything Everywhere All at Once", "Daniel Kwan", 2022, "Sci-Fi"),
            new Movie("Oppenheimer", "Christopher Nolan", 2023, "Drama"),
            new Movie("Past Lives", "Celine Song", 2023, "Romance"),
            new Movie("The Batman", "Matt Reeves", 2022, "Action")
        );
        movieRepository.saveAll(movies);

        // ── Users ───────────────────────────────
        User user1 = new User("cinephile", "cinephile@letterboxd.com");
        User user2 = new User("filmfan", "filmfan@movies.com");
        userRepository.save(user1);
        userRepository.save(user2);

        // ── Watchlist for user1 (5 films queued) ─
        user1.getWatchlist().add(movies.get(14)); // The Lighthouse
        user1.getWatchlist().add(movies.get(15)); // Portrait of a Lady on Fire
        user1.getWatchlist().add(movies.get(16)); // Everything Everywhere
        user1.getWatchlist().add(movies.get(18)); // Past Lives
        user1.getWatchlist().add(movies.get(19)); // The Batman
        userRepository.save(user1);

        // ── Watched films for user1 (10 logged) ─
        watchedFilmRepository.saveAll(List.of(
            new WatchedFilm(user1, movies.get(0), "A mind-bending masterpiece. Nolan at his best.", 4.5, LocalDate.of(2026, 4, 28)),
            new WatchedFilm(user1, movies.get(1), "Made me cry in IMAX. The docking scene is unforgettable.", 5.0, LocalDate.of(2026, 4, 25)),
            new WatchedFilm(user1, movies.get(2), "Charming and whimsical. Every frame is a painting.", 4.0, LocalDate.of(2026, 4, 20)),
            new WatchedFilm(user1, movies.get(3), "Absolutely floored. The twist hit like a truck.", 5.0, LocalDate.of(2026, 4, 15)),
            new WatchedFilm(user1, movies.get(4), "Beautiful but bittersweet. The ending broke me.", 4.0, LocalDate.of(2026, 4, 10)),
            new WatchedFilm(user1, movies.get(5), "Poetic and deeply moving. A quiet masterpiece.", 4.5, LocalDate.of(2026, 4, 5)),
            new WatchedFilm(user1, movies.get(8), "Pure magic. Miyazaki is a genius.", 5.0, LocalDate.of(2026, 3, 28)),
            new WatchedFilm(user1, movies.get(9), "Hauntingly beautiful. The mood is everything.", 4.5, LocalDate.of(2026, 3, 20)),
            new WatchedFilm(user1, movies.get(12), "Surprisingly emotional for a film about an AI.", 4.0, LocalDate.of(2026, 3, 15)),
            new WatchedFilm(user1, movies.get(13), "Intense. The drumming scenes gave me anxiety.", 5.0, LocalDate.of(2026, 3, 10))
        ));

        // ── Watchlist for user2 ─────────────────
        user2.getWatchlist().add(movies.get(0));  // Inception
        user2.getWatchlist().add(movies.get(3));  // Parasite
        userRepository.save(user2);

        // ── Watched films for user2 ─────────────
        watchedFilmRepository.saveAll(List.of(
            new WatchedFilm(user2, movies.get(6), "The best prison film ever made. Period.", 5.0, LocalDate.of(2026, 5, 1)),
            new WatchedFilm(user2, movies.get(7), "Rewatched for the 5th time. Still iconic.", 4.5, LocalDate.of(2026, 4, 30)),
            new WatchedFilm(user2, movies.get(11), "Cool, stylish, violent. The elevator scene.", 3.5, LocalDate.of(2026, 4, 28))
        ));

        System.out.println("✓ Database seeded: " + movies.size() + " movies, 2 users, watchlists & diary entries created.");
    }
}
