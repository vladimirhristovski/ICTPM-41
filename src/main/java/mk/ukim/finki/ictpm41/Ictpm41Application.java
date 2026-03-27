package mk.ukim.finki.ictpm41;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Ictpm41Application {
    public static void main(String[] args) {
        SpringApplication.run(Ictpm41Application.class, args);
    }
}