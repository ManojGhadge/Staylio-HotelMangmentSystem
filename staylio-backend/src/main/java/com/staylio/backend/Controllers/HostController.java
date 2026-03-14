package com.staylio.backend.Controllers;

import com.staylio.backend.model.Host;
import com.staylio.backend.Service.HostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hosts")
@CrossOrigin(origins = "*")
public class HostController {

    @Autowired
    private HostService hostService;

    @Autowired
    private com.staylio.backend.Service.EmailService emailService;

    // GET - Get all hosts
    @GetMapping
    public ResponseEntity<List<Host>> getAllHosts() {
        try {
            List<Host> hosts = hostService.getAllHosts();
            return ResponseEntity.ok(hosts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET - Get all pending hosts
    @GetMapping("/pending")
    public ResponseEntity<List<Host>> getPendingHosts() {
        try {
            List<Host> pendingHosts = hostService.getPendingHosts();
            return ResponseEntity.ok(pendingHosts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET - Get host by ID
    @GetMapping("/{id}")
    public ResponseEntity<Host> getHostById(@PathVariable Long id) {
        try {
            Host host = hostService.getHostById(id);
            return ResponseEntity.ok(host);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // POST - Create new host
    @PostMapping
    public ResponseEntity<Host> createHost(@RequestBody Host host) {
        try {
            Host createdHost = hostService.createHost(host);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdHost);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT - Update host
    @PutMapping("/{id}")
    public ResponseEntity<Host> updateHost(@PathVariable Long id, @RequestBody Host hostDetails) {
        try {
            Host updatedHost = hostService.updateHost(id, hostDetails);
            return ResponseEntity.ok(updatedHost);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            } else if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // DELETE - Delete host
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHost(@PathVariable Long id) {
        try {
            hostService.deleteHost(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT - Approve host
    @PutMapping("/{id}/approve")
    public ResponseEntity<Host> approveHost(@PathVariable Long id) {
        try {
            Host approvedHost = hostService.approveHost(id);

            // Send approval email
            try {
                emailService.sendHostApprovalEmail(
                        approvedHost.getEmail(),
                        approvedHost.getOwnerName(),
                        approvedHost.getCompanyName());
            } catch (Exception emailEx) {
                System.err.println("Failed to send host approval email: " + emailEx.getMessage());
            }

            return ResponseEntity.ok(approvedHost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // PUT - Reject host
    @PutMapping("/{id}/reject")
    public ResponseEntity<Host> rejectHost(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            Host rejectedHost = hostService.rejectHost(id, reason);

            // Send rejection email
            try {
                emailService.sendHostRejectionEmail(
                        rejectedHost.getEmail(),
                        rejectedHost.getOwnerName(),
                        reason);
            } catch (Exception emailEx) {
                System.err.println("Failed to send host rejection email: " + emailEx.getMessage());
            }

            return ResponseEntity.ok(rejectedHost);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // GET - Check if email exists
    @GetMapping("/exists/email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        try {
            boolean exists = hostService.existsByEmail(email);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}