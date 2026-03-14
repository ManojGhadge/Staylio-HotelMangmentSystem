package com.staylio.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotel_claims")
public class HotelClaim {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "host_id", nullable = false)
    private Long hostId;
    
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;
    
    @Column(name = "business_name")
    private String businessName;
    
    @Column(name = "claim_reason", columnDefinition = "TEXT", nullable = false)
    private String claimReason;
    
    @Column(name = "association_details", columnDefinition = "TEXT", nullable = false)
    private String associationDetails;
    
    @Column(name = "contact_details", nullable = false)
    private String contactDetails;
    
    @Column(name = "document_urls", columnDefinition = "TEXT")
    private String documentUrls;
    
    @Column(name = "government_id_url")
    private String governmentIdUrl;
    
    @Column(name = "additional_proof", columnDefinition = "TEXT")
    private String additionalProof;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;
    
    @Column(name = "rejection_message", columnDefinition = "TEXT")
    private String rejectionMessage;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    // Enum for claim status
    public enum ClaimStatus {
        PENDING_APPROVAL, APPROVED, REJECTED
    }
    
    // Constructors
    public HotelClaim() {
    }
    
    // JPA lifecycle methods
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ClaimStatus.PENDING_APPROVAL;
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getHostId() {
        return hostId;
    }
    
    public void setHostId(Long hostId) {
        this.hostId = hostId;
    }
    
    public Long getHotelId() {
        return hotelId;
    }
    
    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }
    
    public String getBusinessName() {
        return businessName;
    }
    
    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }
    
    public String getClaimReason() {
        return claimReason;
    }
    
    public void setClaimReason(String claimReason) {
        this.claimReason = claimReason;
    }
    
    public String getAssociationDetails() {
        return associationDetails;
    }
    
    public void setAssociationDetails(String associationDetails) {
        this.associationDetails = associationDetails;
    }
    
    public String getContactDetails() {
        return contactDetails;
    }
    
    public void setContactDetails(String contactDetails) {
        this.contactDetails = contactDetails;
    }
    
    public String getDocumentUrls() {
        return documentUrls;
    }
    
    public void setDocumentUrls(String documentUrls) {
        this.documentUrls = documentUrls;
    }
    
    public String getGovernmentIdUrl() {
        return governmentIdUrl;
    }
    
    public void setGovernmentIdUrl(String governmentIdUrl) {
        this.governmentIdUrl = governmentIdUrl;
    }
    
    public String getAdditionalProof() {
        return additionalProof;
    }
    
    public void setAdditionalProof(String additionalProof) {
        this.additionalProof = additionalProof;
    }
    
    public ClaimStatus getStatus() {
        return status;
    }
    
    public void setStatus(ClaimStatus status) {
        this.status = status;
    }
    
    public String getRejectionMessage() {
        return rejectionMessage;
    }
    
    public void setRejectionMessage(String rejectionMessage) {
        this.rejectionMessage = rejectionMessage;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
    
    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
    
    @Override
    public String toString() {
        return "HotelClaim{" +
                "id=" + id +
                ", hostId=" + hostId +
                ", hotelId=" + hotelId +
                ", businessName='" + businessName + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}
