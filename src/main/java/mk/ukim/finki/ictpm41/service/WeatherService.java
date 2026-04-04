package mk.ukim.finki.ictpm41.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.WeatherReading;
import mk.ukim.finki.ictpm41.repository.WeatherReadingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherService {

    private final RestTemplate restTemplate;
    private final WeatherReadingRepository weatherReadingRepository;

    @Value("${openmeteo.base.url}")
    private String openMeteoBaseUrl;

    public WeatherReading fetchAndSave(Field field) {
        String url = buildUrl(field.getLatitude(), field.getLongitude());

        log.info("Fetching weather for field '{}' from Open-Meteo", field.getName());

        Map response = restTemplate.getForObject(url, Map.class);

        if (response == null) {
            throw new RuntimeException("Empty response from Open-Meteo for field: " + field.getName());
        }

        Map<String, List<?>> hourly = (Map<String, List<?>>) response.get("hourly");

        WeatherReading reading = new WeatherReading();
        reading.setField(field);
        reading.setTemperature(getDouble(hourly, "temperature_2m", 0));
        reading.setHumidity(getInteger(hourly, "relative_humidity_2m", 0));
        reading.setWindSpeed(getDouble(hourly, "wind_speed_10m", 0));
        reading.setWindDirection(getInteger(hourly, "wind_direction_10m", 0));
        reading.setPressure(getDouble(hourly, "pressure_msl", 0));
        reading.setPrecipitation(getDouble(hourly, "precipitation", 0));
        reading.setSoilMoisture(getDouble(hourly, "soil_moisture_0_to_1cm", 0));
        reading.setFireWeatherIndex(getDouble(hourly, "fire_weather_index", 0));

        return weatherReadingRepository.save(reading);
    }

    private String buildUrl(double lat, double lon) {
        return openMeteoBaseUrl + "/forecast"
                + "?latitude=" + lat
                + "&longitude=" + lon
                + "&hourly=temperature_2m"
                + ",relative_humidity_2m"
                + ",precipitation"
                + ",wind_speed_10m"
                + ",wind_direction_10m"
                + ",pressure_msl"
                + ",soil_moisture_0_to_1cm"
                + ",fire_weather_index"
                + "&forecast_days=1"
                + "&timezone=Europe%2FSkopje";
    }

    private Double getDouble(Map<String, List<?>> hourly, String key, int index) {
        try {
            List<?> values = hourly.get(key);
            if (values == null || values.isEmpty()) return null;
            Object val = values.get(index);
            return val == null ? null : ((Number) val).doubleValue();
        } catch (Exception e) {
            log.warn("Could not parse '{}' from Open-Meteo response", key);
            return null;
        }
    }

    private Integer getInteger(Map<String, List<?>> hourly, String key, int index) {
        try {
            List<?> values = hourly.get(key);
            if (values == null || values.isEmpty()) return null;
            Object val = values.get(index);
            return val == null ? null : ((Number) val).intValue();
        } catch (Exception e) {
            log.warn("Could not parse '{}' from Open-Meteo response", key);
            return null;
        }
    }
}