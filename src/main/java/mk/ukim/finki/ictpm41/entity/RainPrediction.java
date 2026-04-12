package mk.ukim.finki.ictpm41.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rain_predictions")
@Data
public class RainPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @Column(name = "predicted_at")
    private LocalDateTime predictedAt = LocalDateTime.now();

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "rain_probability", nullable = false)
    private Double rainProbability;

    @Column(name = "expected_mm")
    private Double expectedMm;

    @Column(name = "will_rain", nullable = false)
    private Boolean willRain;
}