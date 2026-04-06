package mk.ukim.finki.ictpm41.controller;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.ictpm41.dto.AlertResponse;
import mk.ukim.finki.ictpm41.entity.FireRiskPrediction;
import mk.ukim.finki.ictpm41.entity.RainPrediction;
import mk.ukim.finki.ictpm41.repository.FireRiskPredictionRepository;
import mk.ukim.finki.ictpm41.repository.RainPredictionRepository;
import mk.ukim.finki.ictpm41.service.AlertService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final RainPredictionRepository rainPredictionRepository;
    private final FireRiskPredictionRepository fireRiskPredictionRepository;
    private final AlertService alertService;

    @GetMapping("/rain/{fieldId}")
    public List<RainPrediction> getRainForecast(@PathVariable Long fieldId) {
        return rainPredictionRepository
                .findByFieldIdAndForecastDateBetweenOrderByForecastDateAsc(
                        fieldId, LocalDate.now(), LocalDate.now().plusDays(6));
    }

    @GetMapping("/fire/{fieldId}")
    public FireRiskPrediction getFireRisk(@PathVariable Long fieldId) {
        return fireRiskPredictionRepository
                .findTopByFieldIdOrderByPredictedAtDesc(fieldId)
                .orElse(null);
    }

    @GetMapping("/alerts/count")
    public long getUnreadCount() {
        return alertService.countUnreadAlerts(1L);
    }

    @GetMapping("/alerts/unread")
    public List<AlertResponse> getUnreadAlerts() {
        return alertService.getUnreadAlertsForUser(1L);
    }
}