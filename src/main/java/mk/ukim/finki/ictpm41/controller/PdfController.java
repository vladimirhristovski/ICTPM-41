package mk.ukim.finki.ictpm41.controller;

import mk.ukim.finki.ictpm41.service.PdfReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    @Autowired
    private PdfReportService pdfReportService;

    @GetMapping("/fire-risk/{predictionId}")
    public ResponseEntity<byte[]> downloadFireRiskPdf(@PathVariable Long predictionId) {
        try {
            byte[] pdf = pdfReportService.generateFireRiskReport(predictionId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=fire-risk-report-" + predictionId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}