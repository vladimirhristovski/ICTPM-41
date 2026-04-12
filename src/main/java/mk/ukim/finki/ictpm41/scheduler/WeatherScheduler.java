package mk.ukim.finki.ictpm41.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.WeatherReading;
import mk.ukim.finki.ictpm41.repository.FieldRepository;
import mk.ukim.finki.ictpm41.service.AiPredictionService;
import mk.ukim.finki.ictpm41.service.WeatherService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeatherScheduler {

    private final FieldRepository fieldRepository;
    private final WeatherService weatherService;
    private final AiPredictionService aiPredictionService;

    @Scheduled(cron = "${scheduler.weather.fetch.cron}")
    public void fetchWeatherForAllFields() {
        List<Field> fields = fieldRepository.findAll();
        log.info("Weather scheduler started — processing {} fields", fields.size());

        for (Field field : fields) {
            try {
                WeatherReading reading = weatherService.fetchAndSave(field);
                log.info("Weather fetched for field '{}' (id={})", field.getName(), field.getId());

                aiPredictionService.predictAndSave(field, reading);
                log.info("AI prediction done for field '{}'", field.getName());

            } catch (Exception e) {
                log.error("Failed to process field '{}' (id={}): {}", field.getName(), field.getId(), e.getMessage());
            }
        }

        log.info("Weather scheduler finished");
    }
}