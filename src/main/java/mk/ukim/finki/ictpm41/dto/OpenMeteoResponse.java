package mk.ukim.finki.ictpm41.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenMeteoResponse {

    private Hourly hourly;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Hourly {

        private List<Double> temperature_2m;
        private List<Integer> relative_humidity_2m;
        private List<Double> precipitation;
        private List<Double> wind_speed_10m;
        private List<Integer> wind_direction_10m;
        private List<Double> pressure_msl;
        private List<Double> soil_moisture_0_to_1cm;
        private List<Double> fire_weather_index;

    }
}
