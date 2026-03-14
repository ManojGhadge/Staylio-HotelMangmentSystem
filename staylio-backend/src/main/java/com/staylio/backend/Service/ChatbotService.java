package com.staylio.backend.Service;

import com.staylio.backend.dto.ChatbotRequest;
import com.staylio.backend.dto.ChatbotResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Value;

@Service
public class ChatbotService {

    @Value("${ai.agent.url:http://localhost:5000/agent/query}")
    private String aiAgentUrl;

    public ChatbotResponse processQuery(ChatbotRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<ChatbotRequest> entity = new HttpEntity<>(request, headers);

        // This expects the Python service to return the exact structure of
        // ChatbotResponse
        return restTemplate.postForObject(aiAgentUrl, entity, ChatbotResponse.class);
    }
}
