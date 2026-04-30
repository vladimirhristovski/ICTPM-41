package mk.ukim.finki.ictpm41.controller;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.ictpm41.repository.FieldRepository;
import mk.ukim.finki.ictpm41.repository.FireRiskPredictionRepository;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import mk.ukim.finki.ictpm41.service.PdfReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
public class PdfController {

    private final PdfReportService pdfReportService;
    private final FireRiskPredictionRepository fireRiskPredictionRepository;
    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;

    @GetMapping("/fire-risk/field/{fieldId}")
    public ResponseEntity<byte[]> downloadFireRiskPdfByField(
            @PathVariable Long fieldId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();

            // Check the field belongs to this user
            if (!fieldRepository.existsByIdAndUserId(fieldId, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Long predictionId = fireRiskPredictionRepository
                    .findTopByFieldIdOrderByPredictedAtDesc(fieldId)
                    .orElseThrow(() -> new RuntimeException("No prediction found for this field"))
                    .getId();

            byte[] pdf = pdfReportService.generateFireRiskReport(predictionId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=fire-risk-report-field-" + fieldId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}