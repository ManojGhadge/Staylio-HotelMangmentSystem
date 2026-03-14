package com.staylio.backend.Controllers;

import com.staylio.backend.model.Room;
import com.staylio.backend.Service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping("/hotels/{hotelId}/hotel-rooms")
    public ResponseEntity<Map<String, Object>> getRooms(@PathVariable Long hotelId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", roomService.getRoomsByHotelId(hotelId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/hotels/{hotelId}/hotel-rooms/available")
    public ResponseEntity<Map<String, Object>> getAvailableRooms(@PathVariable Long hotelId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", roomService.getActiveRoomsByHotelId(hotelId));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/hotels/{hotelId}/hotel-rooms")
    public ResponseEntity<Map<String, Object>> createRoom(@PathVariable Long hotelId, @RequestBody Room room,
            @RequestParam Long hostId) {
        room.setHotelId(hotelId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", roomService.createRoom(room, hostId));
        return ResponseEntity.ok(response);
    }

    @PutMapping("/hotels/{hotelId}/hotel-rooms/{roomId}")
    public ResponseEntity<Map<String, Object>> updateRoom(@PathVariable Long hotelId, @PathVariable Long roomId,
            @RequestBody Room room, @RequestParam Long hostId) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", roomService.updateRoom(roomId, room, hostId));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/hotels/{hotelId}/hotel-rooms/{roomId}")
    public ResponseEntity<Map<String, Object>> deleteRoom(@PathVariable Long hotelId, @PathVariable Long roomId,
            @RequestParam Long hostId) {
        roomService.deleteRoom(roomId, hostId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
