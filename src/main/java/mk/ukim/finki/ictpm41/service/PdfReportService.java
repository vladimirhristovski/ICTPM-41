package mk.ukim.finki.ictpm41.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import mk.ukim.finki.ictpm41.entity.FireRiskPrediction;
import mk.ukim.finki.ictpm41.repository.FireRiskPredictionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfReportService {

    @Autowired
    private FireRiskPredictionRepository fireRiskPredictionRepository;

    public byte[] generateFireRiskReport(Long predictionId) throws Exception {
        FireRiskPrediction p = fireRiskPredictionRepository.findById(predictionId)
                .orElseThrow(() -> new RuntimeException("Prediction not found"));

        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.DARK_GRAY);
        Paragraph title = new Paragraph("Fire Risk Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Date
        Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
        Paragraph date = new Paragraph(
                "Generated: " + p.getPredictedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")),
                dateFont
        );
        date.setAlignment(Element.ALIGN_CENTER);
        date.setSpacingAfter(20);
        document.add(date);

        // Table
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(90);
        table.setSpacingBefore(10);

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, BaseColor.WHITE);
        Font cellFont   = FontFactory.getFont(FontFactory.HELVETICA, 11);

        addRow(table, "Field Name",    p.getField().getName(),              headerFont, cellFont);
        addRow(table, "Location",
                "Lat: " + p.getField().getLatitude() + ", Lon: " + p.getField().getLongitude(),
                headerFont, cellFont);
        addRow(table, "Risk Level",    p.getRiskLevel(),                    headerFont, cellFont);
        addRow(table, "Risk Score",    String.format("%.2f", p.getRiskScore()), headerFont, cellFont);
        addRow(table, "Temperature",   p.getTemperature() + " °C",          headerFont, cellFont);
        addRow(table, "Humidity",      p.getHumidity() + " %",              headerFont, cellFont);
        addRow(table, "Wind Speed",    p.getWindSpeed() + " km/h",          headerFont, cellFont);
        addRow(table, "FWI",           String.format("%.2f", p.getFwi()),   headerFont, cellFont);

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    private void addRow(PdfPTable table, String label, String value,
                        Font headerFont, Font cellFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, headerFont));
        labelCell.setBackgroundColor(new BaseColor(60, 90, 60));
        labelCell.setPadding(8);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "-", cellFont));
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }
}