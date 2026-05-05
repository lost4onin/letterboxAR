package com.example.letterboxd.model;


import jakarta.persistence.*;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "watched_films")
@IdClass(WatchedFilmId.class)
public class WatchedFilm {

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"watchlist", "email"})
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @Id
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate watchedDate;

    private String review;
    private Double rating;

    public WatchedFilm() {}

    public WatchedFilm(User user, Movie movie, String review, Double rating, LocalDate watchedDate) {
        this.user = user;
        this.movie = movie;
        this.review = review;
        this.rating = rating;
        this.watchedDate = watchedDate;
    }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Movie getMovie() { return movie; }
    public void setMovie(Movie movie) { this.movie = movie; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public LocalDate getWatchedDate() { return watchedDate; }
    public void setWatchedDate(LocalDate watchedDate) { this.watchedDate = watchedDate; }
}