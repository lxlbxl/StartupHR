# Product Requirements Document (PRD)
## Product: PRIORITY TALENT Job Listing Web Platform

### 1. Product Overview
**Purpose:** Create a modern, user-friendly job listing platform for StartupHR to post open positions, manage applications, and provide candidates with a seamless, engaging application experience.

**Target Users:**
- **Job Seekers:** Individuals looking to browse open roles and apply effortlessly.
- **StartupHR Admin:** Internal HR team members who post jobs, review applications, and manage the hiring pipeline.

---

### 2. Core Goals
- **Showcase Opportunities:** Clearly display current job openings with intuitive filtering and search capabilities.
- **Enhance Applicant Experience:** Replace traditional forms with a seamless, multi-step, quiz-style application process to increase completion rates and reduce cognitive load.
- **Streamline Admin Workflow:** Provide a sleek, functional Single Page Application (SPA) dashboard for admins to manage the entire job lifecycle without page reloads.
- **Data Collection & Storage:** Securely collect structured applicant information and resumes for internal review.

---

### 3. User Flows

#### 3.1 Candidate Flow
1. **Discovery:** Visits Careers/Jobs Page and views a summary list of open roles.
2. **Exploration:** Uses filters (Industry, Location, Job Type) or keyword search to find relevant roles.
3. **Detail View:** Clicks a job card to read the full Job Description (JD).
4. **Application (Quiz-Style):** Clicks "Apply Now" and enters the interactive, multi-step application flow.
5. **Submission:** Completes progressive fields, uploads resume, and submits.
6. **Confirmation:** Sees a success screen and receives an automated confirmation email.

#### 3.2 Admin Flow
1. **Authentication:** Logs into the secure SPA Admin Dashboard.
2. **Dashboard Overview:** Views high-level metrics (active jobs, total applications, recent activity).
3. **Job Management:** Creates, edits, publishes, or archives job postings.
4. **Applicant Review:** Views a detailed list or board of applicants per job, downloads resumes, and manages candidate data.
5. **Data Export:** Exports applicant lists (CSV) for external reporting.

---

### 4. Detailed Requirements

#### 4.1 Job Listing Page (Candidate Facing)
**Main View (Job Cards):**
- Job Title
- Industry
- Pay Range
- Location (City, State, or Remote)
- Job Type (Full-time / Part-time / Contract / Remote / Hybrid)
- Closing Date
- "View Details" Call-to-Action (CTA)

**Search & Filtering Capabilities:**
- Keyword search bar
- Filter by Industry
- Filter by Location
- Filter by Job Type

#### 4.2 Job Description (JD) Page (Candidate Facing)
**Job Details Display:**
- All job card fields plus richer context.
- Full Job Description (rich text support).
- Responsibilities (bullet format).
- Requirements (bullet format).
- Benefits & Perks.
- Prominent "Apply Now" button (sticky on mobile devices).

#### 4.3 Multi-Step Application Form (Candidate Facing)
*A seamless, quiz-style progressive form to improve UX and conversion rates.*

**Step 1: Basic Information**
- Full Name (Validation: Required)
- Email Address (Validation: Standard email regex, Required)
- Phone Number (Validation: Required)

**Step 2: Experience & Details (Configurable by Admin)**
- Years of Experience
- LinkedIn Profile URL
- Portfolio URL
- Current Location & Availability

**Step 3: Documents & Salary**
- Resume Upload (Validation: PDF/DOC/DOCX only, Max size limit)
- Cover Letter (Optional text area or file upload)
- Expected Salary

**Submission Behavior:**
- Real-time inline field validation.
- Auto-advancement or clear "Next" buttons with a progress indicator (e.g., a progress bar or "Step 2 of 3").
- Friendly success message: *"Thank you for applying. Your application is under review."*
- Trigger backend to send confirmation email to candidate.
- Store application securely for admin review.

#### 4.4 Admin Dashboard (SPA - Single Page Application)
*A sleek, fast, and functional Single Page Application built for HR efficiency.*

**Job Management:**
- Create new jobs using a rich-text editor for descriptions.
- Edit existing job postings.
- Set closing dates.
- Archive, Delete, or Mark as "Closed".

**Application Management:**
- View table/list of submitted applications per job.
- Quick preview sidebar/modal for candidate profiles.
- Download resumes securely.
- Export applicant list to CSV.

**Analytics & Insights:**
- Detailed insight dashboard showing application volume, popular jobs, etc.
- Advanced search and sorting features across the candidate database.

---

### 5. UI/UX Requirements
- **Architecture:** Admin side must be a true SPA (Single Page Application) for instantaneous navigation and a modern feel.
- **Form Design:** Candidate application must be a multi-step, quiz-style interface with smooth animated transitions between questions.
- **Responsiveness:** 100% mobile-responsive (crucial for the candidate flow).
- **Aesthetics:** Clean, minimal layout, easy-to-read typography, and clear primary CTA buttons.
- **Accessibility:** WCAG-friendly (proper contrast ratios, keyboard navigation support, ARIA labels).

---

### 6. Technical Requirements
- **Frontend (Candidate & Admin):** React.js to power the SPA admin dashboard and the interactive candidate UI.
- **Backend:** PHP API (e.g., Laravel) to manage job listings, user sessions, and application data securely.
- **Database:** MySQL/SQLite(testing) to store jobs, applications, and admin metadata.
- **File Storage:** Secure system/cloud bucket for resume storage.
- **Email Integration:** SMTP or API provider (e.g., SendGrid, Postmark) for confirmation emails.

---

### 7. Future Enhancements (Phase 2+)
- Candidate login portal & personalized dashboard.
- Real-time application status tracking.
- Automated email notifications to admins upon new application receipt.
- Automated status update/rejection emails to candidates.
- Built-in interview scheduling (e.g., Calendly integration).
- Full ATS (Applicant Tracking System) integration.
- Auto-expire jobs dynamically after the closing date.
- Advanced SEO optimization (Google Jobs schema markup) for public job pages.
