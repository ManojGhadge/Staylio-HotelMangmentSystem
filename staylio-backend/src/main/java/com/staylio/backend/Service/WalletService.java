package com.staylio.backend.Service;

import com.staylio.backend.Repo.WalletRepository;
import com.staylio.backend.Repo.WalletTransactionRepository;
import com.staylio.backend.model.Wallet;
import com.staylio.backend.model.WalletTransaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    public Wallet getOrCreateAdminWallet() {
        Optional<Wallet> adminWallet = walletRepository.findByOwnerType(Wallet.OwnerType.ADMIN);
        if (adminWallet.isPresent()) {
            return adminWallet.get();
        }
        Wallet newAdminWallet = new Wallet(Wallet.OwnerType.ADMIN, null);
        return walletRepository.save(newAdminWallet);
    }

    public Wallet getOrCreateUserWallet(Long userId) {
        Optional<Wallet> userWallet = walletRepository.findByOwnerTypeAndOwnerId(Wallet.OwnerType.USER, userId);
        if (userWallet.isPresent()) {
            return userWallet.get();
        }
        Wallet newUserWallet = new Wallet(Wallet.OwnerType.USER, userId);
        return walletRepository.save(newUserWallet);
    }

    public Wallet getOrCreateHostWallet(Long hostId) {
        Optional<Wallet> hostWallet = walletRepository.findByOwnerTypeAndOwnerId(Wallet.OwnerType.HOST, hostId);
        if (hostWallet.isPresent()) {
            return hostWallet.get();
        }
        Wallet newHostWallet = new Wallet(Wallet.OwnerType.HOST, hostId);
        return walletRepository.save(newHostWallet);
    }

    @Transactional
    public void processOnlinePayment(Long userId, BigDecimal amount, Long bookingId) {
        Wallet adminWallet = getOrCreateAdminWallet();
        Wallet userWallet = getOrCreateUserWallet(userId);

        // Update balances
        // For online payment via gateway, we assume money comes from outside, so we
        // just credit admin
        // However, to track user contribution, we can debit user wallet if they loaded
        // it,
        // OR simply record the transaction from User (Null check) to Admin.
        // Rule: User pays ONLINE -> Money goes to ADMIN WALLET.

        // We treat it as: Gateway -> Admin Wallet
        // We record From: UserWallet (for tracking) To: AdminWallet

        // Optimistically update Admin Balance
        adminWallet.setBalance(adminWallet.getBalance().add(amount));
        adminWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(adminWallet);

        // Record Transaction
        WalletTransaction transaction = new WalletTransaction(
                userWallet.getId(),
                adminWallet.getId(),
                bookingId,
                amount,
                WalletTransaction.TransactionType.USER_PAYMENT,
                "Online booking payment received");
        walletTransactionRepository.save(transaction);
    }

    @Transactional
    public void processRefund(Long userId, BigDecimal amount, Long bookingId) {
        Wallet adminWallet = getOrCreateAdminWallet();
        Wallet userWallet = getOrCreateUserWallet(userId);

        if (adminWallet.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds in Admin Wallet for refund.");
        }

        // Debit Admin
        adminWallet.setBalance(adminWallet.getBalance().subtract(amount));
        adminWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(adminWallet);

        // Credit User
        userWallet.setBalance(userWallet.getBalance().add(amount));
        userWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(userWallet);

        // Record Transaction
        WalletTransaction transaction = new WalletTransaction(
                adminWallet.getId(),
                userWallet.getId(),
                bookingId,
                amount,
                WalletTransaction.TransactionType.USER_REFUND,
                "Refund for cancelled booking (within 24h)");
        walletTransactionRepository.save(transaction);
    }

    @Transactional
    public void processHostSettlement(Long hostId, BigDecimal amount, Long bookingId) {
        Wallet adminWallet = getOrCreateAdminWallet();
        Wallet hostWallet = getOrCreateHostWallet(hostId);

        if (adminWallet.getBalance().compareTo(amount) < 0) {
            // In real world, this is critical. For now, we allow or throw.
            // throw new IllegalStateException("Insufficient funds in Admin Wallet for
            // settlement.");
            // We'll proceed but log warning if negative? No, obey strict rule:
            throw new IllegalStateException("Insufficient funds in Admin Wallet for settlement.");
        }

        // Debit Admin
        adminWallet.setBalance(adminWallet.getBalance().subtract(amount));
        adminWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(adminWallet);

        // Credit Host
        hostWallet.setBalance(hostWallet.getBalance().add(amount));
        hostWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(hostWallet);

        // Record Transaction
        WalletTransaction transaction = new WalletTransaction(
                adminWallet.getId(),
                hostWallet.getId(),
                bookingId,
                amount,
                WalletTransaction.TransactionType.HOST_SETTLEMENT,
                "Settlement for completed booking");
        walletTransactionRepository.save(transaction);
    }

    public List<WalletTransaction> getWalletTransactions(Long walletId) {
        return walletTransactionRepository.findByFromWalletIdOrToWalletIdOrderByCreatedAtDesc(walletId, walletId);
    }

    public List<WalletTransaction> getAllTransactions() {
        return walletTransactionRepository.findAll();
    }
}
