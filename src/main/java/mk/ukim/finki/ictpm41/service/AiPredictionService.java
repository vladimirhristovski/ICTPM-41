package mk.ukim.finki.ictpm41.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.ictpm41.dto.OpenMeteoResponse;
import mk.ukim.finki.ictpm41.entity.*;
import mk.ukim.finki.ictpm41.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

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
    private final AlertRepository alertRepository;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${openmeteo.base.url}")
    private String openMeteoBaseUrl;

    public void predictAndSave(Field field, WeatherReading reading) {
        try {
            // Fetch 7-day forecast for rain prediction
            OpenMeteoResponse forecast = fetch7DayForecast(field.getLatitude(), field.getLongitude());

            // Predict rain
            predictRain(field, forecast);

            // Predict fire risk
            predictFireRisk(field, reading);

        } catch (Exception e) {
            log.error("Failed to get AI predictions for field '{}': {}", field.getName(), e.getMessage());
            throw new RuntimeException("AI prediction failed", e);
        }
    }

    private void predictRain(Field field, OpenMeteoResponse forecast) {
        try {
            // Prepare 7-day data - take daily values (assuming hourly data, take noon or average)
            List<Double> temps = forecast.getHourly().getTemperature_2m();
            List<Integer> humids = forecast.getHourly().getRelative_humidity_2m();
            List<Double> pressures = forecast.getHourly().getPressure_msl();
            List<Double> winds = forecast.getHourly().getWind_speed_10m();
            List<Double> precips = forecast.getHourly().getPrecipitation();

            // Take values at noon (12:00) for each day, assuming 24 hours per day
            double[] temperatures = new double[7];
            double[] humidity = new double[7];
            double[] pressure = new double[7];
            double[] windSpeed = new double[7];
            double[] precipProb = new double[7];

            for (int i = 0; i < 7; i++) {
                int idx = i * 24 + 12; // noon
                temperatures[i] = getSafeDouble(temps, idx, 20.0);
                humidity[i] = getSafeInt(humids, idx, 50);
                pressure[i] = getSafeDouble(pressures, idx, 1013.0);
                windSpeed[i] = getSafeDouble(winds, idx, 5.0);
                precipProb[i] = getSafeDouble(precips, idx, 0.0) > 0 ? 50.0 : 10.0; // rough estimate
            }

            Map<String, Object> body = Map.of(
                "temperatures", temperatures,
                "humidity", humidity,
                "pressure", pressure,
                "wind_speed", windSpeed,
                "precipitation_prob", precipProb
            );

            Map response = restTemplate.postForObject(aiServiceUrl + "/predict/rain", body, Map.class);

            if (response == null) return;

            List<Double> probabilities = (List<Double>) response.get("rain_probability");
            List<Boolean> willRainList = (List<Boolean>) response.get("will_rain");
            List<Double> expectedMmList = (List<Double>) response.get("expected_mm");

            // Delete old predictions for this field
            rainPredictionRepository.deleteByFieldIdAndForecastDateGreaterThanEqual(field.getId(), LocalDate.now());

            for (int i = 0; i < 7; i++) {
                RainPrediction prediction = new RainPrediction();
                prediction.setField(field);
                prediction.setForecastDate(LocalDate.now().plusDays(i));
                prediction.setRainProbability(probabilities.get(i));
                prediction.setWillRain(willRainList.get(i));
                prediction.setExpectedMm(expectedMmList.get(i));
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

            Map<String, Object> body = Map.of(
                "temperature", reading.getTemperature(),
                "humidity", reading.getHumidity().doubleValue(),
                "wind_speed", reading.getWindSpeed(),
                "fire_weather_index", reading.getFireWeatherIndex() != null ? reading.getFireWeatherIndex() : 0.0,
                "soil_moisture", reading.getSoilMoisture() != null ? reading.getSoilMoisture() : 0.3,
                "vegetation_type", vegetationCode
            );

            Map response = restTemplate.postForObject(aiServiceUrl + "/predict/fire", body, Map.class);

            if (response == null) return;

            Double riskScore = ((Number) response.get("risk_score")).doubleValue();
            String riskLevel = mapRiskLevel((String) response.get("risk_level"));

            FireRiskPrediction prediction = new FireRiskPrediction();
            prediction.setField(field);
            prediction.setRiskScore(riskScore);
            prediction.setRiskLevel(riskLevel);
            prediction.setTemperature(reading.getTemperature());
            prediction.setHumidity(reading.getHumidity().doubleValue());
            prediction.setWindSpeed(reading.getWindSpeed());
            prediction.setFwi(reading.getFireWeatherIndex());
            fireRiskPredictionRepository.save(prediction);

            log.info("Fire risk '{}' saved for field '{}'", prediction.getRiskLevel(), field.getName());

            // Trigger alert if HIGH or EXTREME
            if ("HIGH".equals(riskLevel) || "EXTREME".equals(riskLevel)) {
                createAlert(field, riskLevel, riskScore);
            }

        } catch (Exception e) {
            log.error("Fire prediction failed for field '{}': {}", field.getName(), e.getMessage());
        }
    }

    private OpenMeteoResponse fetch7DayForecast(double lat, double lon) {
        String url = UriComponentsBuilder.fromHttpUrl(openMeteoBaseUrl + "/forecast")
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
                .queryParam("forecast_days", 7)
                .queryParam("timezone", "Europe/Skopje")
                .toUriString();

        return restTemplate.getForObject(url, OpenMeteoResponse.class);
    }

    private void createAlert(Field field, String riskLevel, Double riskScore) {
        Alert alert = new Alert();
        alert.setField(field);
        alert.setAlertType("FIRE_RISK");
        alert.setRiskLevel(riskLevel);
        alert.setMessage(String.format("High fire risk detected for field '%s'. Risk level: %s (score: %.2f)",
            field.getName(), riskLevel, riskScore));
        alertRepository.save(alert);
        log.info("Alert created for field '{}' with risk level {}", field.getName(), riskLevel);
    }

    private String mapRiskLevel(String level) {
        return switch (level.toLowerCase()) {
            case "low" -> "LOW";
            case "medium" -> "MEDIUM";
            case "high" -> "HIGH";
            default -> "LOW";
        };
    }

    private double getSafeDouble(List<Double> list, int idx, double defaultVal) {
        if (list != null && idx < list.size() && list.get(idx) != null) return list.get(idx);
        return defaultVal;
    }

    private double getSafeInt(List<Integer> list, int idx, int defaultVal) {
        if (list != null && idx < list.size() && list.get(idx) != null) return list.get(idx);
        return defaultVal;
    }
}