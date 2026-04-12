package mk.ukim.finki.ictpm41.dto;

import lombok.Data;

import java.util.List;

@Data
public class ForecastResponse {
    private FieldResponse field;
    private List<RainPredictionResponse> rainForecast;
    private FireRiskResponse fireRisk;
}