package mk.ukim.finki.ictpm41.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
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

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Title
        document.add(new Paragraph("Fire Risk Report")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10));

        // Date
        document.add(new Paragraph("Generated: " +
                p.getPredictedAt().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20));

        // Table
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 60}));
        table.setWidth(UnitValue.createPercentValue(90));

        DeviceRgb headerColor = new DeviceRgb(60, 90, 60);

        addRow(table, "Field Name", p.getField().getName(), headerColor);
        addRow(table, "Location",
                "Lat: " + p.getField().getLatitude() + ", Lon: " + p.getField().getLongitude(),
                headerColor);
        addRow(table, "Risk Level", p.getRiskLevel(), headerColor);
        addRow(table, "Risk Score", String.format("%.2f", p.getRiskScore()), headerColor);
        addRow(table, "Temperature", p.getTemperature() + " °C", headerColor);
        addRow(table, "Humidity", p.getHumidity() + " %", headerColor);
        addRow(table, "Wind Speed", p.getWindSpeed() + " km/h", headerColor);
        addRow(table, "FWI", String.format("%.2f", p.getFwi()), headerColor);

        document.add(table);
        document.close();

        return out.toByteArray();
    }

    private void addRow(Table table, String label, String value, DeviceRgb headerColor) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(headerColor)
                .setPadding(8);
        table.addCell(labelCell);

        Cell valueCell = new Cell()
                .add(new Paragraph(value != null ? value : "-"))
                .setPadding(8);
        table.addCell(valueCell);
    }
}