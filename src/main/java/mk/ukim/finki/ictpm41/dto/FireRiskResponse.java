package mk.ukim.finki.ictpm41.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FireRiskResponse {
    private Double riskScore;
    private String riskLevel;
    private Double temperature;
    private Double humidity;
    private Double windSpeed;
    private Double fwi;
    private LocalDateTime predictedAt;
}