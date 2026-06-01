<div align="center">

#  ENIPATH
### Plateforme Éducative Intelligente

**An AI-powered e-learning platform dedicated to ENICAR students**  
*Ecole Nationale d'Ingénieurs de Carthage — Academic Year 2025–2026*

![Angular](https://img.shields.io/badge/-Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/-Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JWT](https://img.shields.io/badge/-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Maven](https://img.shields.io/badge/-Maven-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

</div>

---

##  About the Project

**ENIPath** is an intelligent educational platform that centralizes all ENICAR courses, provides access to advanced training programs (AI, cybersecurity, cloud), and delivers school-recognized certifications.

The platform solves a real problem: academic resources at ENICAR were scattered across emails, unorganized drives, and external platforms — causing time loss and fragmented learning. ENIPath unifies everything in one place and extends the training offer with AI-powered features.

---

##  Features

###  Student
- Personalized dashboard with progression statistics
- Course library organized by semester, subject and level
- Quiz system with configurable attempts and pass scores
- Final exams with automatic PDF certificate generation
- Badge system: **FormationCertifiée** (60–89%) and ** Expert** (≥90%)
- AI assistant: Speech-to-Text, OCR with auto-summary, AI quiz generator
- Profile management with CV upload and social links

###  Teacher
- Upload and manage courses (Markdown, PDF)
- Create quizzes with custom parameters
- View class and student progress statistics
- Send targeted announcements by group
- Real-time messaging with department head

###  Department Head
- Advanced analytics dashboard by semester, subject and group
- Manage student complaints and requests
- Publish targeted announcements
- Internal messaging with teachers

###  Admin
- Full platform KPI monitoring
- Manage users, notifications, and content
- Audit certifications and platform activity

---

##  Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 17 (SPA) | Reactive user interface |
| **Backend** | Spring Boot 3 | REST API & business logic |
| **Database** | MySQL 8 | Relational data persistence |
| **ORM** | Spring Data JPA | Database layer |
| **Security** | JWT + BCrypt + RBAC | Stateless auth & role-based access |
| **AI** | Groq LLM API | Speech-to-Text, OCR, quiz generation |
| **Build** | Maven | Dependency management |
| **Quality** | SonarQube | Code analysis & vulnerability detection |
| **API Docs** | Swagger / OpenAPI | REST endpoint documentation |

---

##  Architecture

The platform follows a **Three-Tier** architecture:
| Layer | Technology | Port |
|-------|-----------|------|
|  **Presentation** | Angular 17 SPA | 4200 |
|  **Business** | Spring Boot — JWT REST API (ADMIN / ENSEIGNANT / ETUDIANT) | 8080 |
|  **Data** | MySQL 8 + Spring Data JPA + daily backups | 3306 |
##  Getting Started

### Prerequisites
- **Java 17+**
- **Node.js 18+**
- **Angular CLI** (`npm install -g @angular/cli`)
- **MySQL 8+**
- **Maven**

### 1. Database Setup
```sql
CREATE DATABASE enipath;
```

### 2. Backend Setup
```bash
cd enipathf
./mvnw spring-boot:run
```
Configure `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/enipath
spring.datasource.username=root
spring.datasource.password=your_password
```
> Backend: **http://localhost:8080** | Swagger: **http://localhost:8080/swagger-ui.html**

### 3. Frontend Setup
```bash
cd enipath-frontfinal
npm install
ng serve
```
> Frontend: **http://localhost:4200**

---

##  Security
- **JWT Stateless** — signed token with embedded role on every request
- **RBAC** — access controlled by role (ADMIN, ENSEIGNANT, ETUDIANT)
- **BCrypt** — irreversible password hashing
- **CORS** — strict configuration for Angular origins
- **Daily automated backups** with 30-day retention

---

##  AI Features

| Feature | Description |
|---------|-------------|
|  Speech-to-Text | Voice converted to text, then processed by AI |
|  OCR Module | Text extraction from uploaded images with auto-summary |
|  AI Quiz Generator | Dynamic quiz creation on any topic via LLM |
|  Content Generator | Auto-generate Markdown courses, QCM, full module structures |

---

##  Project Management

**Agile SCRUM** — 4 sprints of 2 weeks each:
-  **Sprint 1** — Specs & Wireframes (Feb 1–15, 2026)
-  **Sprint 2** — Auth & Core Backend (Feb 16 – Mar 1, 2026)
-  **Sprint 3** — Courses & Student Dashboard (Mar 2–15, 2026)
-  **Sprint 4** — AI Integration & Certifications

Tools: **Jira**, **GitHub**, **SonarQube**

---

##  Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time | ≤ 200ms |
| PDF Certificate Generation | ≤ 3 seconds |
| Concurrent Users | 200+ |
| Availability | 99.5% |
| Test Coverage | ≥ 70% |

---

##  Team

| Name | Role |
|------|------|
| **Chrabekh Azza** | Full-Stack Developer |
| **Jleli Sahar** | Full-Stack Developer |
| **Rokbani Marwa** | Full-Stack Developer |
| **Yahya Ghofrane** | Full-Stack Developer |

**Supervised by:** Mr. Faouzi Jaidi  
**Institution:** ENICAR — Academic Year 2025–2026

---

##  License
This project was developed as part of an academic program at ENICAR.  
All rights reserved © 2026 ENIPath Team.
