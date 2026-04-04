package mk.ukim.finki.ictpm41.service;

import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import mk.ukim.finki.ictpm41.dto.FieldRequest;
import mk.ukim.finki.ictpm41.dto.FieldResponse;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.User;
import mk.ukim.finki.ictpm41.repository.FieldRepository;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class FieldService {

    @Autowired
    private FieldRepository fieldRepository;

    @Autowired
    private UserRepository userRepository;

    private FieldResponse toResponse(Field f) {
        FieldResponse r = new FieldResponse();
        r.setId(f.getId());
        r.setName(f.getName());
        r.setLatitude(f.getLatitude());
        r.setLongitude(f.getLongitude());
        r.setVegetationType(f.getVegetationType());
        r.setSizeHectares(f.getSizeHectares());
        r.setElevation(f.getElevation());
        r.setCreatedAt(f.getCreatedAt());
        return r;
    }

    public List<FieldResponse> getAllFieldsForUser(Long userId) {
        return fieldRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FieldResponse getFieldById(Long id, Long userId) {
        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        if (!field.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return toResponse(field);
    }

    public FieldResponse createField(FieldRequest dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Field field = new Field();
        field.setUser(user);
        field.setName(dto.getName());
        field.setLatitude(dto.getLatitude());
        field.setLongitude(dto.getLongitude());
        field.setVegetationType(dto.getVegetationType());
        field.setSizeHectares(dto.getSizeHectares());
        field.setElevation(dto.getElevation());
        field.setCreatedAt(LocalDateTime.now());

        return toResponse(fieldRepository.save(field));
    }

    public FieldResponse updateField(Long id, FieldRequest dto, Long userId) {
        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Field not found"));

        if (!field.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        field.setName(dto.getName());
        field.setLatitude(dto.getLatitude());
        field.setLongitude(dto.getLongitude());
        field.setVegetationType(dto.getVegetationType());
        field.setSizeHectares(dto.getSizeHectares());
        field.setElevation(dto.getElevation());

        return toResponse(fieldRepository.save(field));
    }

    public void deleteField(Long id, Long userId) {
        if (!fieldRepository.existsByIdAndUserId(id, userId)) {
            throw new RuntimeException("Field not found or access denied");
        }
        fieldRepository.deleteById(id);
    }

    public List<FieldResponse> importFromCsv(MultipartFile file, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Field> toSave = new ArrayList<>();

        try (CSVReader reader = new CSVReader(
                new InputStreamReader(file.getInputStream()))) {

            List<String[]> rows = reader.readAll();
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                Field f = new Field();
                f.setUser(user);
                f.setName(row[0]);
                f.setLatitude(Double.parseDouble(row[1]));
                f.setLongitude(Double.parseDouble(row[2]));
                f.setVegetationType(row[3]);
                f.setSizeHectares(row[4].isBlank() ? null : Double.parseDouble(row[4]));
                f.setElevation(row[5].isBlank() ? null : Double.parseDouble(row[5]));
                f.setCreatedAt(LocalDateTime.now());
                toSave.add(f);
            }

        } catch (CsvException e) {
            throw new IOException("Invalid CSV format: " + e.getMessage());
        }

        return fieldRepository.saveAll(toSave)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // --- CSV EXPORT ---
    public byte[] exportToCsv(Long userId) throws IOException {
        List<Field> fields = fieldRepository.findByUserId(userId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out))) {
            writer.writeNext(new String[]{
                    "name", "latitude", "longitude",
                    "vegetation_type", "size_hectares", "elevation"
            });
            for (Field f : fields) {
                writer.writeNext(new String[]{
                        f.getName(),
                        String.valueOf(f.getLatitude()),
                        String.valueOf(f.getLongitude()),
                        f.getVegetationType(),
                        f.getSizeHectares() != null ? String.valueOf(f.getSizeHectares()) : "",
                        f.getElevation() != null ? String.valueOf(f.getElevation()) : ""
                });
            }
        }

        return out.toByteArray();
    }
}