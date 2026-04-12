package mk.ukim.finki.ictpm41.repository;

import mk.ukim.finki.ictpm41.entity.RainPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RainPredictionRepository extends JpaRepository<RainPrediction, Long> {
    List<RainPrediction> findByFieldIdAndForecastDateBetweenOrderByForecastDateAsc(
            Long fieldId, LocalDate from, LocalDate to
    );

    void deleteByFieldIdAndForecastDateGreaterThanEqual(Long fieldId, LocalDate from);
}