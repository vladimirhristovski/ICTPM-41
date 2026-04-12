package mk.ukim.finki.ictpm41.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "weather_readings")
@Data
public class WeatherReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private Field field;

    @Column(name = "fetched_at")
    private LocalDateTime fetchedAt = LocalDateTime.now();

    private Double temperature;
    private Integer humidity;

    @Column(name = "wind_speed")
    private Double windSpeed;

    @Column(name = "wind_direction")
    private Integer windDirection;

    private Double pressure;
    private Double precipitation;

    @Column(name = "soil_moisture")
    private Double soilMoisture;

    @Column(name = "fire_weather_index")
    private Double fireWeatherIndex;
}