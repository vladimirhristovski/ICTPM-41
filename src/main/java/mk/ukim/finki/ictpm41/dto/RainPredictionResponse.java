package mk.ukim.finki.ictpm41.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RainPredictionResponse {
    private LocalDate forecastDate;
    private Double rainProbability;
    private Double expectedMm;
    private Boolean willRain;
}