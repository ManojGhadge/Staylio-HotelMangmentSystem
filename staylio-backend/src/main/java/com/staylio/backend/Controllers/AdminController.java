package com.staylio.backend.Controllers;

import com.staylio.backend.model.Admin;
import com.staylio.backend.model.Host;
import com.staylio.backend.model.Hotel;
import com.staylio.backend.model.User;
import com.staylio.backend.Service.AdminService;
import com.staylio.backend.Service.HostService;
import com.staylio.backend.Service.HotelService;
import com.staylio.backend.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private HostService hostService;
    
    @Autowired
    private HotelService hotelService;
    
    @Autowired
    private UserService userService;
    
    // Get all pending host applications
    @GetMapping("/hosts/pending")
    public ResponseEntity<List<Host>> getPendingHosts() {
        try {
            List<Host> pendingHosts = hostService.getPendingHosts();
            return ResponseEntity.ok(pendingHosts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all hosts (approved/rejected/pending)
    @GetMapping("/hosts")
    public ResponseEntity<List<Host>> getAllHosts() {
        try {
            List<Host> hosts = hostService.getAllHosts();
            return ResponseEntity.ok(hosts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Approve host application
    @PutMapping("/hosts/{hostId}/approve")
    public ResponseEntity<Map<String, Object>> approveHost(@PathVariable Long hostId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Host approvedHost = hostService.approveHost(hostId);
            
            response.put("success", true);
            response.put("message", "Host approved successfully");
            response.put("host", approvedHost);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Host not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to approve host: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Reject host application
    @PutMapping("/hosts/{hostId}/reject")
    public ResponseEntity<Map<String, Object>> rejectHost(
            @PathVariable Long hostId, 
            @RequestBody RejectRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Host rejectedHost = hostService.rejectHost(hostId, request.getReason());
            
            response.put("success", true);
            response.put("message", "Host rejected successfully");
            response.put("host", rejectedHost);
            response.put("reason", request.getReason());
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Host not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to reject host: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // Get host by ID
    @GetMapping("/hosts/{hostId}")
    public ResponseEntity<Host> getHostById(@PathVariable Long hostId) {
        try {
            Host host = hostService.getHostById(hostId);
            return ResponseEntity.ok(host);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // ==================== ADMIN AUTHENTICATION ====================
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody AdminLoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Admin admin = adminService.authenticateAdmin(request.getEmail(), request.getPassword());
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("admin", Map.of(
                "id", admin.getId(),
                "name", admin.getName(),
                "email", admin.getEmail(),
                "phone", admin.getPhone()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // ==================== HOTELS MANAGEMENT ====================
    
    @GetMapping("/hotels")
    public ResponseEntity<List<Hotel>> getAllHotels() {
        try {
            List<Hotel> hotels = hotelService.getAllHotels();
            return ResponseEntity.ok(hotels);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/hotels/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable Long id) {
        try {
            return hotelService.getHotelById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/hotels")
    public ResponseEntity<Map<String, Object>> createHotel(@RequestBody Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Hotel createdHotel = hotelService.createHotel(hotel);
            
            response.put("success", true);
            response.put("message", "Hotel created successfully");
            response.put("hotel", createdHotel);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create hotel: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/hotels/{id}")
    public ResponseEntity<Map<String, Object>> updateHotel(@PathVariable Long id, @RequestBody Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Hotel updatedHotel = hotelService.updateHotel(id, hotel);
            
            response.put("success", true);
            response.put("message", "Hotel updated successfully");
            response.put("hotel", updatedHotel);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Hotel not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update hotel: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<Map<String, Object>> deleteHotel(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            hotelService.deleteHotel(id);
            
            response.put("success", true);
            response.put("message", "Hotel deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Hotel not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete hotel: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // ==================== HOSTS MANAGEMENT ====================
    
    @PutMapping("/hosts/{id}")
    public ResponseEntity<Map<String, Object>> updateHost(@PathVariable Long id, @RequestBody Host host) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Host updatedHost = hostService.updateHost(id, host);
            
            response.put("success", true);
            response.put("message", "Host updated successfully");
            response.put("host", updatedHost);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update host: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/hosts/{id}")
    public ResponseEntity<Map<String, Object>> deleteHost(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            hostService.deleteHost(id);
            
            response.put("success", true);
            response.put("message", "Host deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Host not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete host: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // ==================== USERS MANAGEMENT ====================
    
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        try {
            return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User createdUser = userService.createUser(user);
            
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("user", createdUser);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable Long id, @RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User updatedUser = userService.updateUser(id, user);
            
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("user", updatedUser);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            userService.deleteUser(id);
            
            response.put("success", true);
            response.put("message", "User deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // ==================== REQUEST DTOs ====================
    
    public static class AdminLoginRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class RejectRequest {
        private String reason;
        
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}