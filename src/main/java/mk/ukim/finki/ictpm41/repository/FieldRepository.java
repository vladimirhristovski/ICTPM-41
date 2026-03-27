package mk.ukim.finki.ictpm41.repository;

import mk.ukim.finki.ictpm41.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FieldRepository extends JpaRepository<Field, Long> {
    List<Field> findByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}