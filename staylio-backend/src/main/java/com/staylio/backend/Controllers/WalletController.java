package com.staylio.backend.Controllers;

import com.staylio.backend.Service.WalletService;
import com.staylio.backend.model.Wallet;
import com.staylio.backend.model.WalletTransaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "*")
public class WalletController {

    @Autowired
    private WalletService walletService;

    // Get Admin Wallet
    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminWallet() {
        try {
            Wallet wallet = walletService.getOrCreateAdminWallet();
            List<WalletTransaction> transactions = walletService.getWalletTransactions(wallet.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("wallet", wallet);
            response.put("transactions", transactions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get Host Wallet
    @GetMapping("/host/{hostId}")
    public ResponseEntity<Map<String, Object>> getHostWallet(@PathVariable Long hostId) {
        try {
            Wallet wallet = walletService.getOrCreateHostWallet(hostId);
            List<WalletTransaction> transactions = walletService.getWalletTransactions(wallet.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("wallet", wallet);
            response.put("transactions", transactions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get User Wallet
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserWallet(@PathVariable Long userId) {
        try {
            Wallet wallet = walletService.getOrCreateUserWallet(userId);
            List<WalletTransaction> transactions = walletService.getWalletTransactions(wallet.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("wallet", wallet);
            response.put("transactions", transactions);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
