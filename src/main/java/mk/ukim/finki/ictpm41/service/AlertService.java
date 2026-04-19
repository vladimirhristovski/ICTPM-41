package mk.ukim.finki.ictpm41.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.ukim.finki.ictpm41.dto.AlertResponse;
import mk.ukim.finki.ictpm41.entity.Alert;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.FireRiskPrediction;
import mk.ukim.finki.ictpm41.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public void checkAndCreateFireAlert(Field field, FireRiskPrediction prediction) {
        String level = prediction.getRiskLevel();

        if (level.equals("HIGH") || level.equals("EXTREME")) {
            Alert alert = new Alert();
            alert.setField(field);
            alert.setAlertType("FIRE_RISK");
            alert.setRiskLevel(level);
            alert.setMessage(buildMessage(field.getName(), level, prediction.getRiskScore()));
            alert.setIsRead(false);
            alertRepository.save(alert);
            log.warn("ALERT created — {} fire risk for field '{}'", level, field.getName());
        }
    }

    public List<AlertResponse> getAlertsForUser(Long userId) {
        return alertRepository
                .findByFieldUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AlertResponse> getUnreadAlertsForUser(Long userId) {
        return alertRepository
                .findByFieldUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long countUnreadAlerts(Long userId) {
        return alertRepository.countByFieldUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long alertId) {
        alertRepository.findById(alertId).ifPresent(alert -> {
            alert.setIsRead(true);
            alertRepository.save(alert);
        });
    }

    public void markAllAsRead(Long userId) {
        List<Alert> unread = alertRepository
                .findByFieldUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(alert -> alert.setIsRead(true));
        alertRepository.saveAll(unread);
    }

    private String buildMessage(String fieldName, String level, Double riskScore) {
        return String.format(
                "%s fire risk detected for field '%s'. Risk score: %.0f%%.",
                level, fieldName, riskScore * 100
        );
    }

    private AlertResponse toResponse(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setFieldName(alert.getField().getName());
        response.setAlertType(alert.getAlertType());
        response.setRiskLevel(alert.getRiskLevel());
        response.setMessage(alert.getMessage());
        response.setIsRead(alert.getIsRead());
        response.setCreatedAt(alert.getCreatedAt());
        return response;
    }
}