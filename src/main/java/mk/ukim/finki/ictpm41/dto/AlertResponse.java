package mk.ukim.finki.ictpm41.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AlertResponse {
    private Long id;
    private String fieldName;
    private String alertType;
    private String riskLevel;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}