package mk.ukim.finki.ictpm41.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FieldResponse {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String vegetationType;
    private Double sizeHectares;
    private Double elevation;
    private LocalDateTime createdAt;
}