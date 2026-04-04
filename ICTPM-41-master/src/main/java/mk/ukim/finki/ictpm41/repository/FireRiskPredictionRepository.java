package mk.ukim.finki.ictpm41.repository;

import mk.ukim.finki.ictpm41.entity.FireRiskPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FireRiskPredictionRepository extends JpaRepository<FireRiskPrediction, Long> {
    Optional<FireRiskPrediction> findTopByFieldIdOrderByPredictedAtDesc(Long fieldId);
}