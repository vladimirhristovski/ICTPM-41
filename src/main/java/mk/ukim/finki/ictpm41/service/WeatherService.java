package mk.ukim.finki.ictpm41.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.ictpm41.dto.OpenMeteoResponse;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.WeatherReading;
import mk.ukim.finki.ictpm41.repository.WeatherReadingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeatherService {

    private final RestTemplate restTemplate;
    private final WeatherReadingRepository weatherReadingRepository;

    @Value("${openmeteo.base.url}")
    private String openMeteoBaseUrl;

    public WeatherReading fetchAndSave(Field field) {
        WeatherReading reading = fetchByCoordinates(field.getLatitude(), field.getLongitude());
        reading.setField(field);
        return weatherReadingRepository.save(reading);
    }

    public WeatherReading fetchByCoordinates(double latitude, double longitude) {
        String url = buildUrl(latitude, longitude);

        log.info("Fetching weather from Open-Meteo for lat={}, lon={}", latitude, longitude);

        OpenMeteoResponse response = restTemplate.getForObject(url, OpenMeteoResponse.class);

        if (response == null || response.getHourly() == null) {
            throw new RuntimeException("Invalid response from Open-Meteo");
        }

        OpenMeteoResponse.Hourly hourly = response.getHourly();

        WeatherReading reading = new WeatherReading();
        reading.setTemperature(getSafeDouble(hourly.getTemperature_2m(), 0));
        reading.setHumidity(getSafeInteger(hourly.getRelative_humidity_2m(), 0));
        reading.setWindSpeed(getSafeDouble(hourly.getWind_speed_10m(), 0));
        reading.setWindDirection(getSafeInteger(hourly.getWind_direction_10m(), 0));
        reading.setPressure(getSafeDouble(hourly.getPressure_msl(), 0));
        reading.setPrecipitation(getSafeDouble(hourly.getPrecipitation(), 0));
        reading.setSoilMoisture(getSafeDouble(hourly.getSoil_moisture_0_to_1cm(), 0));
        reading.setFireWeatherIndex(getSafeDouble(hourly.getFire_weather_index(), 0));

        return reading;
    }

    private String buildUrl(double lat, double lon) {
        return UriComponentsBuilder.fromHttpUrl(openMeteoBaseUrl + "/forecast")
                .queryParam("latitude", lat)
                .queryParam("longitude", lon)
                .queryParam("hourly", String.join(",",
                        "temperature_2m",
                        "relative_humidity_2m",
                        "precipitation",
                        "wind_speed_10m",
                        "wind_direction_10m",
                        "pressure_msl",
                        "soil_moisture_0_to_1cm"))
                .queryParam("forecast_days", 1)
                .queryParam("timezone", "Europe/Skopje")
                .toUriString();
    }

    private Double getSafeDouble(List<Double> values, int index) {
        if (values == null || values.isEmpty() || index >= values.size()) return null;
        return values.get(index);
    }

    private Integer getSafeInteger(List<Integer> values, int index) {
        if (values == null || values.isEmpty() || index >= values.size()) return null;
        return values.get(index);
    }
}
