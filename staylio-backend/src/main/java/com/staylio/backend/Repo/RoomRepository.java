package com.staylio.backend.Repo;

import com.staylio.backend.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHotelId(Long hotelId);

    List<Room> findByHotelIdAndIsActiveTrue(Long hotelId);

    List<Room> findByHotelIdAndIsActiveTrueAndRoomCountGreaterThan(Long hotelId, Integer minCount);

    java.util.Optional<Room> findByHotelIdAndRoomType(Long hotelId, String roomType);

    long countByHotelId(Long hotelId);
}
