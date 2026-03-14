package com.staylio.backend.Service;

import com.staylio.backend.model.Admin;
import com.staylio.backend.Repo.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Optional;

@Service
public class AdminService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
    
    public Admin getAdminById(Long id) {
        Optional<Admin> admin = adminRepository.findById(id);
        if (admin.isPresent()) {
            return admin.get();
        } else {
            throw new RuntimeException("Admin not found with id: " + id);
        }
    }
    
    public Admin createAdmin(Admin admin) {
        // Check if email already exists
        if (adminRepository.existsByEmail(admin.getEmail())) {
            throw new RuntimeException("Admin with email " + admin.getEmail() + " already exists");
        }
        
        return adminRepository.save(admin);
    }
    
    public Admin updateAdmin(Long id, Admin adminDetails) {
        Admin existingAdmin = getAdminById(id);
        
        // Check if email is being changed and if it already exists
        if (!existingAdmin.getEmail().equals(adminDetails.getEmail()) && 
            adminRepository.existsByEmail(adminDetails.getEmail())) {
            throw new RuntimeException("Admin with email " + adminDetails.getEmail() + " already exists");
        }
        
        existingAdmin.setName(adminDetails.getName());
        existingAdmin.setEmail(adminDetails.getEmail());
        existingAdmin.setPhone(adminDetails.getPhone());
        
        return adminRepository.save(existingAdmin);
    }
    
    public void deleteAdmin(Long id) {
        Admin admin = getAdminById(id);
        adminRepository.delete(admin);
    }
    
    public boolean existsByEmail(String email) {
        return adminRepository.existsByEmail(email);
    }
    
    // Authentication Methods
    public Admin authenticateAdmin(String email, String password) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        
        // Find admin by email
        Optional<Admin> adminOptional = adminRepository.findByEmail(email.trim().toLowerCase());
        if (!adminOptional.isPresent()) {
            throw new RuntimeException("Invalid email or password");
        }
        
        Admin admin = adminOptional.get();
        
        // Verify password
        String hashedPassword = hashPassword(password);
        if (!admin.getPassword().equals(hashedPassword)) {
            throw new RuntimeException("Invalid email or password");
        }
        
        return admin;
    }
    
    public Optional<Admin> getAdminByEmail(String email) {
        return adminRepository.findByEmail(email);
    }
    
    // Password hashing utility
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hashedBytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashedBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}