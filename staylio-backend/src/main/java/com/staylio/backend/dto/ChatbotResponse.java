package com.staylio.backend.dto;

import java.util.List;

public class ChatbotResponse {
    private String answer;
    private List<HotelDTO> suggestedHotels;

    public ChatbotResponse() {
    }

    public ChatbotResponse(String answer, List<HotelDTO> suggestedHotels) {
        this.answer = answer;
        this.suggestedHotels = suggestedHotels;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<HotelDTO> getSuggestedHotels() {
        return suggestedHotels;
    }

    public void setSuggestedHotels(List<HotelDTO> suggestedHotels) {
        this.suggestedHotels = suggestedHotels;
    }
}
