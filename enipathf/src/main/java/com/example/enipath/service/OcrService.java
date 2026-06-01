package com.example.enipath.service;

import com.example.enipath.Config.AiLandingProperties;
import com.example.enipath.model.exception.AiLandingException;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Set;

@Service
public class OcrService {

    private static final Logger log = LoggerFactory.getLogger(OcrService.class);
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/bmp", "image/tiff", "image/webp"
    );

    private final AiLandingProperties props;

    public OcrService(AiLandingProperties props) {
        this.props = props;
    }

    public String extractText(MultipartFile file) {
        validate(file);
        try (ByteArrayInputStream bais = new ByteArrayInputStream(file.getBytes())) {
            BufferedImage image = ImageIO.read(bais);
            if (image == null) throw new AiLandingException("Unreadable image format.");

            ITesseract tesseract = new Tesseract();
            tesseract.setDatapath(props.getOcr().getTessdataPath());
            tesseract.setLanguage(props.getOcr().getLanguage());
            tesseract.setPageSegMode(3);

            String text = tesseract.doOCR(image);
            if (text == null || text.isBlank()) {
                throw new AiLandingException("No text detected in image.");
            }
            return text.trim();
        } catch (AiLandingException e) {
            throw e;
        } catch (Exception e) {
            log.error("OCR failure", e);
            throw new AiLandingException("OCR processing failed: " + e.getMessage(), e);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new AiLandingException("Image file is required.");
        if (file.getSize() > props.getOcr().getMaxFileSizeBytes())
            throw new AiLandingException("Image exceeds max size.");
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct.toLowerCase()))
            throw new AiLandingException("Unsupported image type: " + ct);
    }
}
