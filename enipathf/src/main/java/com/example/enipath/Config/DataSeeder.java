package com.example.enipath.Config;

import com.example.enipath.model.Users.Admin;
import com.example.enipath.model.Users.Enseignant;
import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.model.academic.Matiere;
import com.example.enipath.model.academic.Semestre;
import com.example.enipath.repository.AdminRepository;
import com.example.enipath.repository.EnseignantRepository;
import com.example.enipath.repository.EtudiantRepository;
import com.example.enipath.repository.MatiereRepository;
import com.example.enipath.repository.SemestreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final EtudiantRepository etudiantRepository;
    private final EnseignantRepository enseignantRepository;
    private final AdminRepository adminRepository;
    private final MatiereRepository matiereRepository;
    private final SemestreRepository semestreRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 0. Ensure Admin exists
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setNom("Admin");
            admin.setPrenom("ENIPATH");
            admin.setEmail("admin@enipath.tn");
            admin.setMdp(passwordEncoder.encode("password123"));
            admin.setActif(true);
            adminRepository.save(admin);
        }

        if (etudiantRepository.count() > 0 || enseignantRepository.count() > 0) {
            return; // Already seeded
        }

        // 1. Create Semestres
        Semestre semestre1 = new Semestre();
        semestre1.setCode("SEM1");
        semestre1.setLibelle("Semestre 1");
        semestre1.setOrdre(1);
        
        Semestre semestre2 = new Semestre();
        semestre2.setCode("SEM2");
        semestre2.setLibelle("Semestre 2");
        semestre2.setOrdre(2);
        
        semestreRepository.saveAll(Arrays.asList(semestre1, semestre2));

        // 2. Create Matieres
        Matiere math = new Matiere();
        math.setCode("MAT101");
        math.setNom("Mathématiques Appliquées");
        math.setDescription("Cours avancé de mathématiques");
        math.setEnseignantNom("Dr. Ahmed");
        math.setSemestre(semestre1);

        Matiere phys = new Matiere();
        phys.setCode("PHY101");
        phys.setNom("Physique Quantique");
        phys.setDescription("Introduction à la physique");
        phys.setEnseignantNom("Dr. Sarah");
        phys.setSemestre(semestre1);

        matiereRepository.saveAll(Arrays.asList(math, phys));

        // 3. Create Enseignants (Professeurs)
        Enseignant prof1 = new Enseignant();
        prof1.setNom("Ben Ali");
        prof1.setPrenom("Ahmed");
        prof1.setEmail("ahmed@enicar.tn");
        prof1.setMdp(passwordEncoder.encode("password123"));
        prof1.setActif(true);
        prof1.setDepartement("Informatique");
        prof1.setSpecialite("Mathématiques");
        prof1.setMatiere(math);

        Enseignant prof2 = new Enseignant();
        prof2.setNom("Trabelsi");
        prof2.setPrenom("Sarah");
        prof2.setEmail("sarah@enicar.tn");
        prof2.setMdp(passwordEncoder.encode("password123"));
        prof2.setActif(true);
        prof2.setDepartement("Physique");
        prof2.setSpecialite("Physique");
        prof2.setMatiere(phys);

        Enseignant prof3 = new Enseignant();
        prof3.setNom("Prof");
        prof3.setPrenom("Test");
        prof3.setEmail("prof@enipath.tn");
        prof3.setMdp(passwordEncoder.encode("password123"));
        prof3.setActif(true);
        prof3.setDepartement("Informatique");
        prof3.setSpecialite("Général");
        prof3.setMatiere(math);

        enseignantRepository.saveAll(Arrays.asList(prof1, prof2, prof3));

        // 4. Create Etudiants
        Etudiant etudiant1 = new Etudiant();
        etudiant1.setNom("Gharbi");
        etudiant1.setPrenom("Youssef");
        etudiant1.setEmail("youssef@enicar.tn");
        etudiant1.setMdp(passwordEncoder.encode("password123"));
        etudiant1.setActif(true);
        etudiant1.setNiveau(1);
        etudiant1.setGroupe('A');
        etudiant1.setScore(100);
        etudiant1.setTotalBadges(2);
        etudiant1.getEnseignants().addAll(Arrays.asList(prof1, prof2));

        Etudiant etudiant2 = new Etudiant();
        etudiant2.setNom("Jelassi");
        etudiant2.setPrenom("Fatma");
        etudiant2.setEmail("fatma@enicar.tn");
        etudiant2.setMdp(passwordEncoder.encode("password123"));
        etudiant2.setActif(true);
        etudiant2.setNiveau(1);
        etudiant2.setGroupe('B');
        etudiant2.setScore(150);
        etudiant2.setTotalBadges(3);
        etudiant2.getEnseignants().add(prof1);

        Etudiant etudiant3 = new Etudiant();
        etudiant3.setNom("Etudiant");
        etudiant3.setPrenom("Test");
        etudiant3.setEmail("etudiant@enipath.tn");
        etudiant3.setMdp(passwordEncoder.encode("password123"));
        etudiant3.setActif(true);
        etudiant3.setNiveau(2);
        etudiant3.setGroupe('A');
        etudiant3.setScore(200);
        etudiant3.setTotalBadges(5);
        etudiant3.getEnseignants().addAll(Arrays.asList(prof1, prof3));

        etudiantRepository.saveAll(Arrays.asList(etudiant1, etudiant2, etudiant3));

        System.out.println("Base de données initialisée avec succès avec des données professionnelles !");
        System.out.println("--------------------------------------------------------------------------");
        System.out.println("Vous pouvez vous connecter avec :");
        System.out.println("Admin : admin@enipath.tn / password123");
        System.out.println("Etudiant Test : etudiant@enipath.tn / password123");
        System.out.println("Prof Test : prof@enipath.tn / password123");
        System.out.println("Etudiant 1 : youssef@enicar.tn / password123");
        System.out.println("Etudiant 2 : fatma@enicar.tn / password123");
        System.out.println("Prof 1 : ahmed@enicar.tn / password123");
        System.out.println("Prof 2 : sarah@enicar.tn / password123");
    }
}
