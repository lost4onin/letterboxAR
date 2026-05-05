package com.example.letterboxd.service;

import com.example.letterboxd.model.Movie;
import com.example.letterboxd.model.User;
import com.example.letterboxd.repository.MovieRepository;
import com.example.letterboxd.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    public UserService(UserRepository userRepository, MovieRepository movieRepository) {
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(updatedUser.getUsername());
            user.setEmail(updatedUser.getEmail());
            return userRepository.save(user);
        });
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional
    public Optional<User> addMovieToWatchlist(Long userId, String movieTitle) {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<Movie> movieOpt = movieRepository.findFirstByTitleIgnoreCase(movieTitle);

        if (userOpt.isPresent() && movieOpt.isPresent()) {
            User user = userOpt.get();
            Movie movie = movieOpt.get();
            if (!user.getWatchlist().contains(movie)) {
                user.getWatchlist().add(movie);
                userRepository.save(user);
            }
            return Optional.of(user);
        }
        return Optional.empty();
    }
}