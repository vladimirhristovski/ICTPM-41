package mk.ukim.finki.ictpm41.repository;

import mk.ukim.finki.ictpm41.entity.WeatherReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WeatherReadingRepository extends JpaRepository<WeatherReading, Long> {
    Optional<WeatherReading> findTopByFieldIdOrderByFetchedAtDesc(Long fieldId);
}