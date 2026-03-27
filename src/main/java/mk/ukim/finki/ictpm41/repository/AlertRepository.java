package mk.ukim.finki.ictpm41.repository;

import mk.ukim.finki.ictpm41.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByFieldUserIdOrderByCreatedAtDesc(Long userId);

    List<Alert> findByFieldUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    long countByFieldUserIdAndIsReadFalse(Long userId);
}