package com.staylio.backend.Service;

import com.staylio.backend.model.Hotel;
import com.staylio.backend.model.Room;
import com.staylio.backend.Repo.HotelRepository;
import com.staylio.backend.Repo.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public List<Room> getRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelId(hotelId);
    }

    public List<Room> getActiveRoomsByHotelId(Long hotelId) {
        return roomRepository.findByHotelIdAndIsActiveTrueAndRoomCountGreaterThan(hotelId, 0);
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    @Transactional
    public Room createRoom(Room room, Long hostId) {
        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (!hotel.getHotelOwnerId().equals(hostId)) {
            throw new RuntimeException("Unauthorized");
        }

        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(Long id, Room roomDetails, Long hostId) {
        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Hotel hotel = hotelRepository.findById(existingRoom.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (!hotel.getHotelOwnerId().equals(hostId)) {
            throw new RuntimeException("Unauthorized");
        }

        existingRoom.setRoomType(roomDetails.getRoomType());
        existingRoom.setCategory(roomDetails.getCategory());
        existingRoom.setPricePerNight(roomDetails.getPricePerNight());
        existingRoom.setMaxGuests(roomDetails.getMaxGuests());
        existingRoom.setImageUrl(roomDetails.getImageUrl());
        existingRoom.setAmenities(roomDetails.getAmenities());
        existingRoom.setDescription(roomDetails.getDescription());

        if (roomDetails.getAvailableCount() != null)
            existingRoom.setAvailableCount(roomDetails.getAvailableCount());
        if (roomDetails.getRoomCount() != null)
            existingRoom.setRoomCount(roomDetails.getRoomCount());
        if (roomDetails.getIsActive() != null)
            existingRoom.setIsActive(roomDetails.getIsActive());

        return roomRepository.save(existingRoom);
    }

    @Transactional
    public void deleteRoom(Long id, Long hostId) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (!hotel.getHotelOwnerId().equals(hostId)) {
            throw new RuntimeException("Unauthorized");
        }

        roomRepository.deleteById(id);
    }
}
