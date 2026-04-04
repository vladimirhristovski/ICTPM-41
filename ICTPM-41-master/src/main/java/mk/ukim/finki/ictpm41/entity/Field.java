package mk.ukim.finki.ictpm41.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "fields")
@Data
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(name = "vegetation_type", nullable = false)
    private String vegetationType;

    @Column(name = "size_hectares")
    private Double sizeHectares;

    private Double elevation;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}