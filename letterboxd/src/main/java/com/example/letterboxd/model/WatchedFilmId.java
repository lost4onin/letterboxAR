package com.example.letterboxd.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

public class WatchedFilmId implements Serializable {

    private Long user;
    private Long movie;
    private LocalDate watchedDate;

    public WatchedFilmId() {}

    public WatchedFilmId(Long user, Long movie, LocalDate watchedDate) {
        this.user = user;
        this.movie = movie;
        this.watchedDate = watchedDate;
    }

    public Long getUser() { return user; }
    public void setUser(Long user) { this.user = user; }

    public Long getMovie() { return movie; }
    public void setMovie(Long movie) { this.movie = movie; }

    public LocalDate getWatchedDate() { return watchedDate; }
    public void setWatchedDate(LocalDate watchedDate) { this.watchedDate = watchedDate; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WatchedFilmId)) return false;
        WatchedFilmId that = (WatchedFilmId) o;
        return Objects.equals(user, that.user)
                && Objects.equals(movie, that.movie)
                && Objects.equals(watchedDate, that.watchedDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, movie, watchedDate);
    }
}