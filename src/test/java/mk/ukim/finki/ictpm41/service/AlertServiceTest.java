package mk.ukim.finki.ictpm41.service;

import mk.ukim.finki.ictpm41.dto.AlertResponse;
import mk.ukim.finki.ictpm41.entity.Alert;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.FireRiskPrediction;
import mk.ukim.finki.ictpm41.entity.User;
import mk.ukim.finki.ictpm41.repository.AlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @InjectMocks
    private AlertService alertService;

    private User testUser;
    private Field testField;
    private Alert testAlert;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setRole("USER");

        testField = new Field();
        testField.setId(1L);
        testField.setUser(testUser);
        testField.setName("Test Forest");
        testField.setLatitude(41.99);
        testField.setLongitude(21.43);
        testField.setVegetationType("FOREST");

        testAlert = new Alert();
        testAlert.setId(1L);
        testAlert.setField(testField);
        testAlert.setAlertType("FIRE_RISK");
        testAlert.setRiskLevel("HIGH");
        testAlert.setMessage("HIGH fire risk detected for field 'Test Forest'. Risk score: 82%.");
        testAlert.setIsRead(false);
        testAlert.setCreatedAt(LocalDateTime.now());
    }

    // ── checkAndCreateFireAlert ─────────────────────────────────

    @Test
    void checkAndCreateFireAlert_createsAlert_whenRiskIsHigh() {
        FireRiskPrediction prediction = new FireRiskPrediction();
        prediction.setRiskLevel("HIGH");
        prediction.setRiskScore(0.82);

        alertService.checkAndCreateFireAlert(testField, prediction);

        verify(alertRepository, times(1)).save(any(Alert.class));
    }

    @Test
    void checkAndCreateFireAlert_createsAlert_whenRiskIsExtreme() {
        FireRiskPrediction prediction = new FireRiskPrediction();
        prediction.setRiskLevel("EXTREME");
        prediction.setRiskScore(0.95);

        alertService.checkAndCreateFireAlert(testField, prediction);

        verify(alertRepository, times(1)).save(any(Alert.class));
    }

    @Test
    void checkAndCreateFireAlert_doesNotCreateAlert_whenRiskIsMedium() {
        FireRiskPrediction prediction = new FireRiskPrediction();
        prediction.setRiskLevel("MEDIUM");
        prediction.setRiskScore(0.45);

        alertService.checkAndCreateFireAlert(testField, prediction);

        verify(alertRepository, never()).save(any(Alert.class));
    }

    @Test
    void checkAndCreateFireAlert_doesNotCreateAlert_whenRiskIsLow() {
        FireRiskPrediction prediction = new FireRiskPrediction();
        prediction.setRiskLevel("LOW");
        prediction.setRiskScore(0.10);

        alertService.checkAndCreateFireAlert(testField, prediction);

        verify(alertRepository, never()).save(any(Alert.class));
    }

    // ── getAlertsForUser ────────────────────────────────────────

    @Test
    void getAlertsForUser_returnsAllAlerts() {
        when(alertRepository.findByFieldUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(testAlert));

        List<AlertResponse> result = alertService.getAlertsForUser(1L);

        assertEquals(1, result.size());
        assertEquals("FIRE_RISK", result.get(0).getAlertType());
        assertEquals("HIGH", result.get(0).getRiskLevel());
        assertEquals("Test Forest", result.get(0).getFieldName());
    }

    @Test
    void getAlertsForUser_returnsEmptyList_whenNoAlerts() {
        when(alertRepository.findByFieldUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of());

        List<AlertResponse> result = alertService.getAlertsForUser(1L);

        assertTrue(result.isEmpty());
    }

    // ── getUnreadAlertsForUser ──────────────────────────────────

    @Test
    void getUnreadAlertsForUser_returnsOnlyUnreadAlerts() {
        when(alertRepository.findByFieldUserIdAndIsReadFalseOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(testAlert));

        List<AlertResponse> result = alertService.getUnreadAlertsForUser(1L);

        assertEquals(1, result.size());
        assertFalse(result.get(0).getIsRead());
    }

    // ── countUnreadAlerts ───────────────────────────────────────

    @Test
    void countUnreadAlerts_returnsCorrectCount() {
        when(alertRepository.countByFieldUserIdAndIsReadFalse(1L)).thenReturn(3L);

        long count = alertService.countUnreadAlerts(1L);

        assertEquals(3L, count);
    }

    @Test
    void countUnreadAlerts_returnsZero_whenAllRead() {
        when(alertRepository.countByFieldUserIdAndIsReadFalse(1L)).thenReturn(0L);

        long count = alertService.countUnreadAlerts(1L);

        assertEquals(0L, count);
    }

    // ── markAsRead ──────────────────────────────────────────────

    @Test
    void markAsRead_setsIsReadToTrue() {
        when(alertRepository.findById(1L)).thenReturn(Optional.of(testAlert));

        alertService.markAsRead(1L);

        assertTrue(testAlert.getIsRead());
        verify(alertRepository, times(1)).save(testAlert);
    }

    @Test
    void markAsRead_doesNothing_whenAlertNotFound() {
        when(alertRepository.findById(99L)).thenReturn(Optional.empty());

        alertService.markAsRead(99L);

        verify(alertRepository, never()).save(any(Alert.class));
    }

    // ── markAllAsRead ───────────────────────────────────────────

    @Test
    void markAllAsRead_setsAllAlertsToRead() {
        Alert unreadAlert1 = new Alert();
        unreadAlert1.setId(1L);
        unreadAlert1.setField(testField);
        unreadAlert1.setIsRead(false);
        unreadAlert1.setAlertType("FIRE_RISK");
        unreadAlert1.setRiskLevel("HIGH");
        unreadAlert1.setCreatedAt(LocalDateTime.now());

        Alert unreadAlert2 = new Alert();
        unreadAlert2.setId(2L);
        unreadAlert2.setField(testField);
        unreadAlert2.setIsRead(false);
        unreadAlert2.setAlertType("FIRE_RISK");
        unreadAlert2.setRiskLevel("EXTREME");
        unreadAlert2.setCreatedAt(LocalDateTime.now());

        when(alertRepository.findByFieldUserIdAndIsReadFalseOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(unreadAlert1, unreadAlert2));

        alertService.markAllAsRead(1L);

        assertTrue(unreadAlert1.getIsRead());
        assertTrue(unreadAlert2.getIsRead());
        verify(alertRepository, times(1)).saveAll(any());
    }
}