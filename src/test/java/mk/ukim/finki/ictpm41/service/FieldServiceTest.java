package mk.ukim.finki.ictpm41.service;

import mk.ukim.finki.ictpm41.dto.FieldRequest;
import mk.ukim.finki.ictpm41.dto.FieldResponse;
import mk.ukim.finki.ictpm41.entity.Field;
import mk.ukim.finki.ictpm41.entity.User;
import mk.ukim.finki.ictpm41.repository.FieldRepository;
import mk.ukim.finki.ictpm41.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FieldServiceTest {

    @Mock
    private FieldRepository fieldRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FieldService fieldService;

    private User testUser;
    private Field testField;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setPasswordHash("hashed");
        testUser.setRole("USER");

        testField = new Field();
        testField.setId(1L);
        testField.setUser(testUser);
        testField.setName("Test Field");
        testField.setLatitude(41.99);
        testField.setLongitude(21.43);
        testField.setVegetationType("FOREST");
        testField.setSizeHectares(10.0);
        testField.setElevation(300.0);
        testField.setCreatedAt(LocalDateTime.now());
    }

    // ── getAllFieldsForUser ─────────────────────────────────────

    @Test
    void getAllFieldsForUser_returnsListOfFields() {
        when(fieldRepository.findByUserId(1L)).thenReturn(List.of(testField));

        List<FieldResponse> result = fieldService.getAllFieldsForUser(1L);

        assertEquals(1, result.size());
        assertEquals("Test Field", result.get(0).getName());
        verify(fieldRepository, times(1)).findByUserId(1L);
    }

    @Test
    void getAllFieldsForUser_returnsEmptyList_whenNoFields() {
        when(fieldRepository.findByUserId(1L)).thenReturn(List.of());

        List<FieldResponse> result = fieldService.getAllFieldsForUser(1L);

        assertTrue(result.isEmpty());
    }

    // ── getFieldById ────────────────────────────────────────────

    @Test
    void getFieldById_returnsField_whenOwnerMatches() {
        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

        FieldResponse result = fieldService.getFieldById(1L, 1L);

        assertEquals("Test Field", result.getName());
        assertEquals(41.99, result.getLatitude());
    }

    @Test
    void getFieldById_throwsException_whenFieldNotFound() {
        when(fieldRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                fieldService.getFieldById(99L, 1L)
        );
    }

    @Test
    void getFieldById_throwsException_whenUserDoesNotOwnField() {
        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

        // userId 99 does not own this field
        assertThrows(RuntimeException.class, () ->
                fieldService.getFieldById(1L, 99L)
        );
    }

    // ── createField ─────────────────────────────────────────────

    @Test
    void createField_savesAndReturnsField() {
        FieldRequest request = new FieldRequest();
        request.setName("New Field");
        request.setLatitude(42.0);
        request.setLongitude(21.5);
        request.setVegetationType("CROPS");
        request.setSizeHectares(5.0);
        request.setElevation(200.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(fieldRepository.save(any(Field.class))).thenReturn(testField);

        FieldResponse result = fieldService.createField(request, 1L);

        assertNotNull(result);
        verify(fieldRepository, times(1)).save(any(Field.class));
    }

    @Test
    void createField_throwsException_whenUserNotFound() {
        FieldRequest request = new FieldRequest();
        request.setName("New Field");
        request.setLatitude(42.0);
        request.setLongitude(21.5);
        request.setVegetationType("CROPS");

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                fieldService.createField(request, 99L)
        );
    }

    // ── updateField ─────────────────────────────────────────────

    @Test
    void updateField_updatesAndReturnsField() {
        FieldRequest request = new FieldRequest();
        request.setName("Updated Field");
        request.setLatitude(42.0);
        request.setLongitude(21.5);
        request.setVegetationType("MIXED");
        request.setSizeHectares(8.0);
        request.setElevation(250.0);

        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));
        when(fieldRepository.save(any(Field.class))).thenReturn(testField);

        FieldResponse result = fieldService.updateField(1L, request, 1L);

        assertNotNull(result);
        verify(fieldRepository, times(1)).save(any(Field.class));
    }

    @Test
    void updateField_throwsException_whenUserDoesNotOwnField() {
        FieldRequest request = new FieldRequest();
        request.setName("Updated Field");
        request.setLatitude(42.0);
        request.setLongitude(21.5);
        request.setVegetationType("MIXED");

        when(fieldRepository.findById(1L)).thenReturn(Optional.of(testField));

        assertThrows(RuntimeException.class, () ->
                fieldService.updateField(1L, request, 99L)
        );
    }

    // ── deleteField ─────────────────────────────────────────────

    @Test
    void deleteField_deletesSuccessfully_whenOwnerMatches() {
        when(fieldRepository.existsByIdAndUserId(1L, 1L)).thenReturn(true);

        fieldService.deleteField(1L, 1L);

        verify(fieldRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteField_throwsException_whenFieldNotFoundOrNotOwned() {
        when(fieldRepository.existsByIdAndUserId(99L, 1L)).thenReturn(false);

        assertThrows(RuntimeException.class, () ->
                fieldService.deleteField(99L, 1L)
        );
    }

    // ── importFromCsv ────────────────────────────────────────────

    @Test
    void importFromCsv_savesFieldsFromValidCsv() throws Exception {
        String csvContent = "name,latitude,longitude,vegetation_type,size_hectares,elevation\n"
                + "Field A,41.99,21.43,FOREST,10.0,300.0\n"
                + "Field B,42.01,21.50,CROPS,5.0,\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "fields.csv",
                "text/csv", csvContent.getBytes()
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(fieldRepository.saveAll(any())).thenReturn(List.of(testField, testField));

        List<FieldResponse> result = fieldService.importFromCsv(file, 1L);

        assertEquals(2, result.size());
        verify(fieldRepository, times(1)).saveAll(any());
    }

    @Test
    void importFromCsv_throwsException_whenUserNotFound() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "fields.csv",
                "text/csv", "name,lat,lon".getBytes()
        );

        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                fieldService.importFromCsv(file, 99L)
        );
    }

    // ── exportToCsv ──────────────────────────────────────────────

    @Test
    void exportToCsv_returnsByteArray_withCorrectData() throws Exception {
        when(fieldRepository.findByUserId(1L)).thenReturn(List.of(testField));

        byte[] result = fieldService.exportToCsv(1L);

        assertNotNull(result);
        assertTrue(result.length > 0);

        String csv = new String(result);
        assertTrue(csv.contains("Test Field"));
        assertTrue(csv.contains("41.99"));
        assertTrue(csv.contains("FOREST"));
    }

    @Test
    void exportToCsv_returnsEmptyCsv_whenNoFields() throws Exception {
        when(fieldRepository.findByUserId(1L)).thenReturn(List.of());

        byte[] result = fieldService.exportToCsv(1L);

        assertNotNull(result);
        String csv = new String(result);
        // Should still have the header row
        assertTrue(csv.contains("name"));
    }

    @Test
    void importFromCsv_throwsException_whenCsvIsMalformed() {
        String badCsv = "name,latitude,longitude,vegetation_type,size_hectares,elevation\n"
                + "Field A,NOT_A_NUMBER,21.43,FOREST,10.0,300.0\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "fields.csv",
                "text/csv", badCsv.getBytes()
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(Exception.class, () ->
                fieldService.importFromCsv(file, 1L)
        );
    }

    @Test
    void importFromCsv_returnsEmptyList_whenCsvHasOnlyHeader() throws Exception {
        String emptyCsv = "name,latitude,longitude,vegetation_type,size_hectares,elevation\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "fields.csv",
                "text/csv", emptyCsv.getBytes()
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(fieldRepository.saveAll(any())).thenReturn(List.of());

        List<FieldResponse> result = fieldService.importFromCsv(file, 1L);

        assertTrue(result.isEmpty());
    }
}