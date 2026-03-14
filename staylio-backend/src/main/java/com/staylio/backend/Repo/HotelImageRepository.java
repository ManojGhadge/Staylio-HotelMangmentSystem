package com.staylio.backend.Repo;

import com.staylio.backend.model.HotelImages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HotelImageRepository extends JpaRepository<HotelImages, Long> {
    HotelImages findByHotelId(Long hotelId);
}
