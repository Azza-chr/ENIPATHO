package com.example.enipath.model.academic;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "AcademicQuiz")
@Table(name = "academic_quizzes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titre;

    @Column(nullable = false, length = 1500)
    private String description;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Double passingScore;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapitre_id", unique = true, nullable = true)
    @JsonIgnoreProperties({"matiere", "ressources", "quiz"})
    private Chapitre chapitre;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cours_id", unique = true, nullable = true)
    @JsonIgnoreProperties({"matiere", "quiz"})
    private CoursPdf cours;

    @Builder.Default
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"quiz"})
    private List<Question> questions = new ArrayList<>();

    public double getScoreMinimum() {
        return 0;
    }

    public String getTitreQ() {
        return "";
    }
}
