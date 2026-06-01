package com.example.enipath.service;

import com.example.enipath.model.AutoFormation.BadgeFormation;
import com.example.enipath.model.AutoFormation.Certification;
import com.example.enipath.model.AutoFormation.Formation;
import com.example.enipath.model.AutoFormation.TypeBadgeFormation;
import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.repository.BadgeFormationRepository;
import com.example.enipath.repository.CertificationRepository;
import com.example.enipath.repository.EtudiantRepository;
import com.example.enipath.repository.FormationRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.util.Date;
import java.util.Optional;

@Service
public class FormationService {

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private BadgeFormationRepository badgeFormationRepository;

    public boolean aValideFormation(Long etudiantId, Long formationId, double scoreObtenu) {
        Optional<Formation> formationOpt = formationRepository.findById(formationId);
        if (formationOpt.isEmpty()) return false;
        return scoreObtenu >= formationOpt.get().getScoreMin();
    }

    public String genererCertification(Long etudiantId, Long formationId, double scoreObtenu) {
        Optional<Formation> formationOpt = formationRepository.findById(formationId);
        Optional<Etudiant> etudiantOpt = etudiantRepository.findById(etudiantId);

        if (formationOpt.isEmpty() || etudiantOpt.isEmpty()) {
            return "Étudiant ou formation introuvable.";
        }

        Formation formation = formationOpt.get();
        Etudiant etudiant = etudiantOpt.get();

        if (!aValideFormation(etudiantId, formationId, scoreObtenu)) {
            return "Score insuffisant. Vous avez obtenu " + scoreObtenu
                    + "%. Minimum requis : " + formation.getScoreMin() + "%.";
        }

        // Créer la certification
        Certification certification = new Certification();
        certification.setEtudiant(etudiant);
        certification.setFormation(formation);
        certification.setDateEmission(new Date());
        certification.setTitre("Certification - " + formation.getTitre());
        certificationRepository.save(certification);

        // Attribuer badge FormationCertifiee
        BadgeFormation badge = new BadgeFormation();
        badge.setNomBadge("Certifié : " + formation.getTitre());
        badge.setIcone("🏆");
        badge.setDescription("A validé la formation avec " + scoreObtenu + "%");
        badge.setDateObtention(new Date());
        badge.setType(scoreObtenu >= 90 ? TypeBadgeFormation.Expert : TypeBadgeFormation.FormationCertifiee);
        badge.setEtudiant(etudiant);
        badgeFormationRepository.save(badge);

        // Générer le PDF
        String pdfPath = "certifications/certification_" + etudiantId + "_" + formationId + ".pdf";
        try {
            new java.io.File("certifications").mkdirs();
            Document document = new Document();
            PdfWriter.getInstance(document, new FileOutputStream(pdfPath));
            document.open();

            Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD);
            Font subtitleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.ITALIC);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 14);

            document.add(new Paragraph("ENIPATH", titleFont));
            document.add(new Paragraph("Plateforme de Formation en Ligne", subtitleFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("CERTIFICATION DE RÉUSSITE", titleFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Ceci certifie que :", normalFont));
            document.add(new Paragraph(etudiant.getNom() + " " + etudiant.getPrenom(), titleFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("a validé avec succès la formation :", normalFont));
            document.add(new Paragraph(formation.getTitre(), titleFont));
            document.add(new Paragraph("Domaine : " + formation.getDomaine(), normalFont));
            document.add(new Paragraph("Niveau : " + formation.getNiveau(), normalFont));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Score obtenu : " + scoreObtenu + "%", normalFont));
            document.add(new Paragraph("Score minimum requis : " + formation.getScoreMin() + "%", normalFont));
            document.add(new Paragraph(" "));
            if (scoreObtenu >= 90) {
                document.add(new Paragraph("Badge obtenu : Expert 🌟", normalFont));
            } else {
                document.add(new Paragraph("Badge obtenu : Certifié 🏆", normalFont));
            }
            document.add(new Paragraph("Date : " + new Date(), normalFont));
            document.close();

        } catch (Exception e) {
            return "Erreur génération PDF : " + e.getMessage();
        }

        if (scoreObtenu >= 90) {
            return "Félicitations ! Vous avez obtenu le badge Expert 🌟 et votre certification ! PDF : " + pdfPath;
        }
        return "Félicitations ! Certification et badge 🏆 obtenus ! PDF : " + pdfPath;
    }
}