package com.staylio.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StaylioBackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(StaylioBackendApplication.class, args);

		System.out.println("Staylio Backend is Running.....");
	}

}
