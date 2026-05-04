package mk.ukim.finki.ictpm41.controller;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.ictpm41.dto.FireRiskResponse;
import mk.ukim.finki.ictpm41.dto.RainPredictionResponse;
import mk.ukim.finki.ictpm41.repository.FieldRepository;
import mk.ukim.finki.ictpm41.repository.FireRiskPredictionRepository;
import mk.ukim.finki.ictpm41.repository.RainPredictionRepository;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final RainPredictionRepository rainPredictionRepository;
    private final FireRiskPredictionRepository fireRiskPredictionRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping("/rain/{fieldId}")
    public ResponseEntity<List<RainPredictionResponse>> getRainForecast(
            @PathVariable Long fieldId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        if (!fieldRepository.existsByIdAndUserId(fieldId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<RainPredictionResponse> result = rainPredictionRepository
                .findByFieldIdAndForecastDateBetweenOrderByForecastDateAsc(
                        fieldId, LocalDate.now(), LocalDate.now().plusDays(6))
                .stream()
                .map(p -> {
                    RainPredictionResponse dto = new RainPredictionResponse();
                    dto.setForecastDate(p.getForecastDate());
                    dto.setRainProbability(p.getRainProbability());
                    dto.setExpectedMm(p.getExpectedMm());
                    dto.setWillRain(p.getWillRain());
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    @GetMapping("/fire/{fieldId}")
    public ResponseEntity<FireRiskResponse> getFireRisk(
            @PathVariable Long fieldId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        if (!fieldRepository.existsByIdAndUserId(fieldId, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return fireRiskPredictionRepository
                .findTopByFieldIdOrderByPredictedAtDesc(fieldId)
                .map(p -> {
                    FireRiskResponse dto = new FireRiskResponse();
                    dto.setRiskScore(p.getRiskScore());
                    dto.setRiskLevel(p.getRiskLevel());
                    dto.setTemperature(p.getTemperature());
                    dto.setHumidity(p.getHumidity());
                    dto.setWindSpeed(p.getWindSpeed());
                    dto.setFwi(p.getFwi());
                    dto.setPredictedAt(p.getPredictedAt());
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}