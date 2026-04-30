package mk.ukim.finki.ictpm41.controller;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.ictpm41.dto.AlertResponse;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import mk.ukim.finki.ictpm41.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(alertService.getAlertsForUser(getUserId(userDetails)));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<AlertResponse>> getUnreadAlerts(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(alertService.getUnreadAlertsForUser(getUserId(userDetails)));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(alertService.countUnreadAlerts(getUserId(userDetails)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        alertService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetails userDetails) {
        alertService.markAllAsRead(getUserId(userDetails));
        return ResponseEntity.ok().build();
    }
}