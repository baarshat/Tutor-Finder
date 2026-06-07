package com.tutor_finder.tutorfinder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TutorfinderApplication {

	public static void main(String[] args) {
		SpringApplication.run(TutorfinderApplication.class, args);
	}

}
