package com.example.letterboxd.controller;

import com.example.letterboxd.model.User;
import com.example.letterboxd.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id,
                                           @RequestBody User user) {
        return userService.updateUser(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userService.deleteUser(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // PUT /users/{id}/watchlist?movieTitle=Inception
    @PutMapping("/{id}/watchlist")
    public ResponseEntity<User> addToWatchlist(@PathVariable Long id,
                                               @RequestParam String movieTitle) {
        return userService.addMovieToWatchlist(id, movieTitle)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/watchlist")
    public ResponseEntity<Object> getWatchlist(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok((Object) user.getWatchlist()))
                .orElse(ResponseEntity.notFound().build());
    }
}