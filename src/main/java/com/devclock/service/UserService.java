package com.devclock.service;

import com.devclock.model.User;
import com.devclock.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserFileService userFileService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User createUser(String username, User.Role role) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("User with username '" + username + "' already exists");
        }

        User user = new User(username, role);
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public User getOrCreateUser(String username) {
        Optional<User> existingUser = getUserByUsername(username);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }
        
        throw new IllegalArgumentException("User '" + username + "' not found. Please contact administrator.");
    }

    public User authenticateUser(String username) {
        User fileUser = userFileService.findUserByUsername(username);
        if (fileUser == null) {
            throw new IllegalArgumentException("Invalid username. User not found in system.");
        }
        
        Optional<User> dbUser = getUserByUsername(username);
        if (!dbUser.isPresent()) {
            User newUser = new User(fileUser.getUsername(), fileUser.getRole());
            return userRepository.save(newUser);
        }
        
        User existingUser = dbUser.get();
        if (!existingUser.getRole().equals(fileUser.getRole())) {
            existingUser.setRole(fileUser.getRole());
            return userRepository.save(existingUser);
        }
        
        return existingUser;
    }
}
