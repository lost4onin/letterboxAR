package com.example.letterboxd.repository;

import com.example.letterboxd.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {}