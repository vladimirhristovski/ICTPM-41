package mk.ukim.finki.ictpm41.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.FireRiskPrediction;
import mk.ukim.finki.ictpm41.entity.RainPrediction;
import mk.ukim.finki.ictpm41.entity.WeatherReading;
import mk.ukim.finki.ictpm41.repository.FireRiskPredictionRepository;
import mk.ukim.finki.ictpm41.repository.RainPredictionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiPredictionService {

    private final RestTemplate restTemplate;
    private final RainPredictionRepository rainPredictionRepository;
    private final FireRiskPredictionRepository fireRiskPredictionRepository;
    private final AlertService alertService;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public void predictAndSave(Field field, WeatherReading reading) {
        predictRain(field, reading);
        predictFireRisk(field, reading);
    }

    private void predictRain(Field field, WeatherReading reading) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("temperatures", List.of(reading.getTemperature()));
            body.put("humidity", List.of(reading.getHumidity().doubleValue()));
            body.put("pressure", List.of(reading.getPressure()));
            body.put("wind_speed", List.of(reading.getWindSpeed()));
            body.put("precipitation_prob", List.of(reading.getPrecipitation()));

            Map response = restTemplate.postForObject(
                    aiServiceUrl + "/predict/rain", body, Map.class
            );

            if (response == null) return;

            List<Double> probabilities = (List<Double>) response.get("rain_probability");
            List<Boolean> willRainList = (List<Boolean>) response.get("will_rain");
            List<Double> expectedMmList = (List<Double>) response.get("expected_mm");

            rainPredictionRepository.deleteByFieldIdAndForecastDateGreaterThanEqual(
                    field.getId(), LocalDate.now()
            );

            for (int i = 0; i < 7; i++) {
                RainPrediction prediction = new RainPrediction();
                prediction.setField(field);
                prediction.setForecastDate(LocalDate.now().plusDays(i));
                prediction.setRainProbability(probabilities.get(Math.min(i, probabilities.size() - 1)));
                prediction.setWillRain(willRainList.get(Math.min(i, willRainList.size() - 1)));
                prediction.setExpectedMm(expectedMmList.get(Math.min(i, expectedMmList.size() - 1)));
                rainPredictionRepository.save(prediction);
            }

            log.info("Rain predictions saved for field '{}'", field.getName());

        } catch (Exception e) {
            log.error("Rain prediction failed for field '{}': {}", field.getName(), e.getMessage());
        }
    }

    private void predictFireRisk(Field field, WeatherReading reading) {
        try {
            int vegetationCode = switch (field.getVegetationType().toUpperCase()) {
                case "FOREST" -> 2;
                case "MIXED" -> 1;
                default -> 0;
            };

            Map<String, Object> body = new HashMap<>();
            body.put("temperature", reading.getTemperature());
            body.put("humidity", reading.getHumidity().doubleValue());
            body.put("wind_speed", reading.getWindSpeed());
            body.put("fire_weather_index", reading.getFireWeatherIndex() != null ? reading.getFireWeatherIndex() : 0.0);
            body.put("soil_moisture", reading.getSoilMoisture() != null ? reading.getSoilMoisture() : 0.3);
            body.put("vegetation_type", vegetationCode);

            Map response = restTemplate.postForObject(
                    aiServiceUrl + "/predict/fire", body, Map.class
            );

            if (response == null) return;

            FireRiskPrediction prediction = new FireRiskPrediction();
            prediction.setField(field);
            prediction.setRiskScore(((Number) response.get("risk_score")).doubleValue());
            prediction.setRiskLevel((String) response.get("risk_level"));
            prediction.setTemperature(reading.getTemperature());
            prediction.setHumidity(reading.getHumidity().doubleValue());
            prediction.setWindSpeed(reading.getWindSpeed());
            prediction.setFwi(reading.getFireWeatherIndex());
            fireRiskPredictionRepository.save(prediction);

            log.info("Fire risk '{}' saved for field '{}'", prediction.getRiskLevel(), field.getName());

            alertService.checkAndCreateFireAlert(field, prediction);

        } catch (Exception e) {
            log.error("Fire prediction failed for field '{}': {}", field.getName(), e.getMessage());
        }
    }
}