package com.staylio.backend.Service;

import com.staylio.backend.Repo.HotelImageRepository;
import com.staylio.backend.model.HotelImages;
import com.staylio.backend.Service.HotelImageServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class HotelImageService implements HotelImageServiceInterface {

    @Autowired
    private HotelImageRepository repository;

    @Override
    public List<String> getHotelImages(Long hotelId) {

        HotelImages img = repository.findByHotelId(hotelId);

        if (img == null || img.getPhotosUrls() == null || img.getPhotosUrls().isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(img.getPhotosUrls().split(","))
                .map(String::trim)
                .filter(url -> !url.isEmpty())
                .toList();
    }
}
