ALTER TABLE hotels_image DROP FOREIGN KEY hotels_image_ibfk_1;
ALTER TABLE room_types DROP FOREIGN KEY room_types_ibfk_1;

ALTER TABLE hotels MODIFY id BIGINT NOT NULL AUTO_INCREMENT;

ALTER TABLE hotels_image MODIFY hotel_id BIGINT;
ALTER TABLE room_types MODIFY hotel_id BIGINT;

ALTER TABLE hotels_image ADD CONSTRAINT hotels_image_ibfk_1 FOREIGN KEY (hotel_id) REFERENCES hotels(id);
ALTER TABLE room_types ADD CONSTRAINT room_types_ibfk_1 FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE;
