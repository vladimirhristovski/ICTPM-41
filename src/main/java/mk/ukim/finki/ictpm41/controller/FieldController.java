package mk.ukim.finki.ictpm41.controller;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import jakarta.validation.Valid;
import mk.ukim.finki.ictpm41.dto.FieldRequest;
import mk.ukim.finki.ictpm41.dto.FieldResponse;
import mk.ukim.finki.ictpm41.service.FieldService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/fields")
public class FieldController {

    @Autowired
    private FieldService fieldService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @GetMapping
    public ResponseEntity<List<FieldResponse>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(fieldService.getAllFieldsForUser(getUserId(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FieldResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(fieldService.getFieldById(id, getUserId(userDetails)));
    }

    @PostMapping
    public ResponseEntity<FieldResponse> create(
            @Valid @RequestBody FieldRequest dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fieldService.createField(dto, getUserId(userDetails)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FieldResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody FieldRequest dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(fieldService.updateField(id, dto, getUserId(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        fieldService.deleteField(id, getUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/import")
    public ResponseEntity<List<FieldResponse>> importCsv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(
                    fieldService.importFromCsv(file, getUserId(userDetails)));
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            byte[] data = fieldService.exportToCsv(getUserId(userDetails));
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=fields.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}