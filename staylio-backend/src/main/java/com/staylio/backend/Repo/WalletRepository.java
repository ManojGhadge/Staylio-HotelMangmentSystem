package com.staylio.backend.Repo;

import com.staylio.backend.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByOwnerTypeAndOwnerId(Wallet.OwnerType ownerType, Long ownerId);

    Optional<Wallet> findByOwnerType(Wallet.OwnerType ownerType);
}
