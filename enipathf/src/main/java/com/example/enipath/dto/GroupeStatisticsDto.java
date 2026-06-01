package com.example.enipath.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeStatisticsDto {
    private Character groupe;
    private Integer niveau;
    private int totalStudents;
    private double moyenneScore;
    private double moyenneBadges;
    private int averageAttendance;
    private List<StudentStatisticsDto> students;
}
