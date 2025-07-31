package com.devclock.service;

import com.devclock.model.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserFileService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${app.users.file.path:users.json}")
    private String usersFilePath;
    private final Map<String, LocalDateTime> fileLastModified = new ConcurrentHashMap<>();
    private final Map<String, List<UserConfig>> userCache = new ConcurrentHashMap<>();
    
    public static class UserConfig {
        public String username;
        public String role;
        public String displayName;
        public String description;
        
        public UserConfig() {}
        
        public UserConfig(String username, String role, String displayName, String description) {
            this.username = username;
            this.role = role;
            this.displayName = displayName;
            this.description = description;
        }
    }
    
    public List<UserConfig> getUsers() {
        try {
            Path path = Paths.get(usersFilePath);
            File file = path.toFile();
            
            if (!file.exists()) {
                createDefaultUsersFile();
                return getUsers();
            }
            
            LocalDateTime lastModified = LocalDateTime.ofInstant(
                Files.getLastModifiedTime(path).toInstant(),
                java.time.ZoneId.systemDefault()
            );
            
            LocalDateTime cachedTime = fileLastModified.get(usersFilePath);
            if (cachedTime == null || lastModified.isAfter(cachedTime)) {
                List<UserConfig> users = objectMapper.readValue(file, new TypeReference<List<UserConfig>>() {});
                userCache.put(usersFilePath, users);
                fileLastModified.put(usersFilePath, lastModified);
                return users;
            }
            
            return userCache.get(usersFilePath);
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to read users file: " + e.getMessage(), e);
        }
    }
    
    public User findUserByUsername(String username) {
        List<UserConfig> users = getUsers();
        return users.stream()
            .filter(userConfig -> userConfig.username.equals(username))
            .map(userConfig -> {
                User user = new User();
                user.setUsername(userConfig.username);
                user.setRole(User.Role.valueOf(userConfig.role));
                return user;
            })
            .findFirst()
            .orElse(null);
    }
    
    public boolean userExists(String username) {
        return findUserByUsername(username) != null;
    }
    
    private void createDefaultUsersFile() throws IOException {
        List<UserConfig> defaultUsers = List.of(
            new UserConfig("admin", "ADMIN", "System Administrator", "Default admin user - change credentials in users.json")
        );
        
        objectMapper.writerWithDefaultPrettyPrinter()
            .writeValue(new File(usersFilePath), defaultUsers);
    }
}
