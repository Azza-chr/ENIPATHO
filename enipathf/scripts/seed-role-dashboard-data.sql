-- Comptes de test
-- Mot de passe pour tous les comptes : Password123!
-- Le nouveau endpoint /api/v1/auth/login accepte provisoirement un mot de passe
-- hashé BCrypt ou en clair pour simplifier les tests rapides.

INSERT INTO utilisateur (usr_id, nom, prenom, email, mdp, actif) VALUES
  (1001, 'Amri', 'Salma', 'etudiant@enipath.tn', 'Password123!', true),
  (1002, 'Ben Salah', 'Youssef', 'enseignant@enipath.tn', 'Password123!', true),
  (1003, 'Haddad', 'Meriem', 'chef@enipath.tn', 'Password123!', true);

INSERT INTO etudiant (id, niveau, total_badges, score) VALUES
  (1001, '2eme annee', 4, 78);

INSERT INTO enseignant (id, departement, specialite) VALUES
  (1002, 'Informatique', 'Genie logiciel');

INSERT INTO chef_departement (id, departement) VALUES
  (1003, 'Informatique');

INSERT INTO annonce (annonce_id, titre, contenu, enseignant_id, created_at) VALUES
  (2001, 'Controle continu', 'Le controle continu aura lieu lundi prochain a 9h.', 1002, NOW()),
  (2002, 'Depot TP', 'Merci de deposer le TP avant vendredi 18h.', 1002, NOW());

INSERT INTO etudiant_notification (notification_id, etudiant_id, titre, contenu, lue, created_at) VALUES
  (3001, 1001, 'Nouvelle annonce', 'Controle continu', false, NOW()),
  (3002, 1001, 'Rappel', 'Pense a consulter les annonces du cours.', false, NOW());

INSERT INTO departement_message (message_id, enseignant_id, chef_departement_id, sender_role, objet, contenu, created_at) VALUES
  (4001, 1002, 1003, 'ENSEIGNANT', 'Demande de salle', 'Bonjour, puis-je reserver la salle B12 pour une seance de revision ?', NOW()),
  (4002, 1002, 1003, 'CHEF_DEPARTEMENT', 'Re: Demande de salle', 'Oui, la salle B12 est disponible mardi apres-midi.', NOW());
