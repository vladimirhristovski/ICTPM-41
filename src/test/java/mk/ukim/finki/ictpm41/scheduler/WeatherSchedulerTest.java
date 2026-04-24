package mk.ukim.finki.ictpm41.scheduler;

import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.User;
import mk.ukim.finki.ictpm41.entity.WeatherReading;
import mk.ukim.finki.ictpm41.repository.FieldRepository;
import mk.ukim.finki.ictpm41.service.AiPredictionService;
import mk.ukim.finki.ictpm41.service.WeatherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WeatherSchedulerTest {

    @Mock
    private FieldRepository fieldRepository;

    @Mock
    private WeatherService weatherService;

    @Mock
    private AiPredictionService aiPredictionService;

    @InjectMocks
    private WeatherScheduler weatherScheduler;

    private User testUser;
    private Field testField1;
    private Field testField2;
    private WeatherReading testReading;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setRole("USER");

        testField1 = new Field();
        testField1.setId(1L);
        testField1.setUser(testUser);
        testField1.setName("Forest Field");
        testField1.setLatitude(41.99);
        testField1.setLongitude(21.43);
        testField1.setVegetationType("FOREST");

        testField2 = new Field();
        testField2.setId(2L);
        testField2.setUser(testUser);
        testField2.setName("Crop Field");
        testField2.setLatitude(42.01);
        testField2.setLongitude(21.50);
        testField2.setVegetationType("CROPS");

        testReading = new WeatherReading();
        testReading.setId(1L);
        testReading.setField(testField1);
        testReading.setTemperature(35.0);
        testReading.setHumidity(20);
        testReading.setWindSpeed(40.0);
        testReading.setPressure(1010.0);
        testReading.setPrecipitation(0.0);
        testReading.setFireWeatherIndex(85.0);
        testReading.setFetchedAt(LocalDateTime.now());
    }

    // ── fetchWeatherForAllFields ────────────────────────────────

    @Test
    void scheduler_callsWeatherService_forEachField() {
        when(fieldRepository.findAll()).thenReturn(List.of(testField1, testField2));
        when(weatherService.fetchAndSave(any(Field.class))).thenReturn(testReading);

        weatherScheduler.fetchWeatherForAllFields();

        // WeatherService should be called once per field
        verify(weatherService, times(2)).fetchAndSave(any(Field.class));
    }

    @Test
    void scheduler_callsAiService_forEachField() {
        when(fieldRepository.findAll()).thenReturn(List.of(testField1, testField2));
        when(weatherService.fetchAndSave(any(Field.class))).thenReturn(testReading);

        weatherScheduler.fetchWeatherForAllFields();

        // AiPredictionService should be called once per field
        verify(aiPredictionService, times(2)).predictAndSave(any(Field.class), any(WeatherReading.class));
    }

    @Test
    void scheduler_doesNothing_whenNoFieldsRegistered() {
        when(fieldRepository.findAll()).thenReturn(List.of());

        weatherScheduler.fetchWeatherForAllFields();

        verify(weatherService, never()).fetchAndSave(any(Field.class));
        verify(aiPredictionService, never()).predictAndSave(any(Field.class), any(WeatherReading.class));
    }

    @Test
    void scheduler_continuesProcessing_whenOneFieldFails() {
        when(fieldRepository.findAll()).thenReturn(List.of(testField1, testField2));

        // First field throws exception, second should still be processed
        when(weatherService.fetchAndSave(testField1))
                .thenThrow(new RuntimeException("Open-Meteo unavailable"));
        when(weatherService.fetchAndSave(testField2))
                .thenReturn(testReading);

        // Should not throw — scheduler catches exceptions per field
        weatherScheduler.fetchWeatherForAllFields();

        // Both fields were attempted
        verify(weatherService, times(2)).fetchAndSave(any(Field.class));

        // AI service only called for the field that succeeded
        verify(aiPredictionService, times(1))
                .predictAndSave(any(Field.class), any(WeatherReading.class));
    }

    @Test
    void scheduler_callsWeatherBeforeAi_forEachField() {
        when(fieldRepository.findAll()).thenReturn(List.of(testField1));
        when(weatherService.fetchAndSave(testField1)).thenReturn(testReading);

        weatherScheduler.fetchWeatherForAllFields();

        // Verify order: weather first, then AI
        var inOrder = inOrder(weatherService, aiPredictionService);
        inOrder.verify(weatherService).fetchAndSave(testField1);
        inOrder.verify(aiPredictionService).predictAndSave(testField1, testReading);
    }
}