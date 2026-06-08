# Campus Placements App - Cloud Firestore Schema Report

This report presents the system architecture, collection specifications, document schema blueprints, and primary read/write interaction coordinates within the codebase.

---

## 🚀 Database Architecture Overview

The system runs exclusively on **Google Cloud Firestore**. To prevent security issues and ensure optimal client performance, we utilize a full-stack architecture:
*   **Primary Backend**: Node.js Express server (`/server.ts`) acting as the secure gateway using the Firebase Admin SDK / Web JS SDK.
*   **Adapters**: A custom resilient layer (`ResilientDoc`, `ResilientQuery`) executing direct reads and writes on Firestore. Every database transaction generates localized debug statements including the Active ProjectID, Target Collection, and Operation Results.
*   **Offline Fallbacks**: No local files or temporary JSON engines are used. All actions read and write live collections directly to align with the single source of truth directive.

---

## 📂 Collections Specifications & Blueprints

Here is the document structure and code mappings for each of the required collections:

### 1. `users`
Represents the comprehensive account ledger for authentication, access control lists, and profile statuses.
*   **Document Structure**:
    ```typescript
    interface UserDocument {
      uid: string;                 // User Authentication ID
      name: string;                // Display Name
      email: string;               // Normalized email address
      role: "student" | "company" | "tpo"; // Access Control Role
      verificationStatus: "draft" | "pending" | "verified" | "rejected";
      profileCompletion: number;   // Percentage progress (0 - 100)
      createdAt: string;           // ISO 8601 string
      updatedAt?: string;          // ISO 8601 string
    }
    ```
*   **Read Paths**:
    *   `/api/auth/login` (Lines ~820-850) - Query matches credentials.
    *   `/api/user/profile` (Lines ~900-920) - Retrieve active authentications.
*   **Write Paths**:
    *   `/api/auth/register` (Lines ~750-810) - Insert and save account registration.
    *   `/api/user/update-status` (Lines ~1100-1150) - Merge/update profile completions.

---

### 2. `students`
Tracks academic transcripts, educational branches, CGPAs, resume links, and job eligibility criteria.
*   **Document Structure**:
    ```typescript
    interface StudentDocument {
      id: string;                  // Matches User uid
      name: string;
      email: string;
      rollNumber?: string;
      branch: string;              // e.g., "Computer Science", "Information Technology"
      cgpa: number;                // Cumulative GPA out of 10.0
      backlogs: number;            // Count of active/dead backlogs
      resumeUrl?: string;          // Cloud Storage secure resource URL
      skills: string[];            // List of software/engineering talent tags
      verificationStatus: "draft" | "pending" | "verified" | "rejected";
      verificationFeedback?: string;
    }
    ```
*   **Read Paths**:
    *   `/api/students` (Lines ~1010-1040) - Fetch list of active candidates.
    *   `/api/students/:id` (Lines ~1045-1070) - Show verified detail profile view.
*   **Write Paths**:
    *   `/api/students/profile` (Lines ~930-970) - Create or update personal information.
    *   `/api/tpo/verify-student` (Lines ~1305-1350) - Confirm student profile verification status.

---

### 3. `recruiters` (and `companies`)
Stores corporate profiles, verified placement partners, contact coordinates, and analytics.
*   **Document Structure**:
    ```typescript
    interface RecruiterDocument {
      id: string;                  // Matches User uid
      name: string;                // Company Name
      email: string;
      website?: string;
      industry?: string;           // e.g., "Fintech", "Cloud Platforms"
      about?: string;
      logoUrl?: string;
      status: "pending" | "verified" | "rejected";
    }
    ```
*   **Read Paths**:
    *   `/api/companies` (Lines ~1150-1180) - Retrieve corporate entities list.
    *   `/api/companies/:id` (Lines ~1185-1210) - Pull public corporate analytics.
*   **Write Paths**:
    *   `/api/companies/profile` (Lines ~1110-1140) - Create or update workspace assets.

---

### 4. `jobs`
Maintains internal drive requirements, salary details, deadline specifications, and active placements.
*   **Document Structure**:
    ```typescript
    interface JobDocument {
      id: string;                  // Generated d-* coordinate
      companyId: string;           // ID of the recruiter posting the target job
      companyName: string;
      jobRole: string;             // e.g., "Associate Frontend Engineer"
      type: "placement" | "internship";
      location: string;
      packageLPA: number;          // Compensation in LPA
      branchEligibility: string[]; // List of permitted branch criteria
      minimumCgpa: number;         // Threshold grade (e.g., 8.0)
      allowedBacklogs: number;     // Backlog tolerances
      jobDescription: string;
      skillsRequired: string[];
      driveDate?: string;          // Formatted event date
      applicationDeadline: string; // Closing timestamp
      approvalStatus: "pending" | "approved" | "rejected";
    }
    ```
*   **Read Paths**:
    *   `/api/opportunities` (Lines ~1360-1390) - Get interactive dashboard list.
    *   `/api/opportunities/:id` (Lines ~1395-1410) - Details for application views.
*   **Write Paths**:
    *   `/api/drives` (Lines ~1412-1460) - Create corporate job opportunities.
    *   `/api/drives/:id` (Lines ~1772-1810) - Update requirements and skills list.

---

### 5. `internships`
Stores the exact duplicated index payload matching any posted jobs with type parameter set specifically to `"internship"`.
*   **Document Structure**: Identical to `jobs` Document schema where `type: "internship"`.
*   **Read Paths**:
    *   `/api/opportunities?type=internship` triggers query on `/internships`.
*   **Write Paths**: Coupled automatically to `jobs` modifications:
    *   On custom creation: `await fdb.collection("internships").doc(driveId).set(...)` (Line ~1435)
    *   On status corrections: `await fdb.collection("internships").doc(driveId).set(...)` (Line ~1484)
    *   On updates: `await fdb.collection("internships").doc(driveId).set(...)` (Line ~1798)
    *   On removals: `await fdb.collection("internships").doc(driveId).delete()` (Line ~1831)

---

### 6. `placementDrives`
Stores the exact duplicated index payload matching any posted jobs with type parameter set specifically to `"placement"`.
*   **Document Structure**: Identical to `jobs` Document schema where `type: "placement"`.
*   **Read Paths**:
    *   `/api/opportunities?type=placement` queries the `/placementDrives` collection.
*   **Write Paths**: Coupled automatically to `jobs` modifications:
    *   On creation: `await fdb.collection("placementDrives").doc(driveId).set(...)` (Line ~1436)
    *   On verification: `await fdb.collection("placementDrives").doc(driveId).set(...)` (Line ~1485)
    *   On update: `await fdb.collection("placementDrives").doc(driveId).set(...)` (Line ~1799)
    *   On removal: `await fdb.collection("placementDrives").doc(driveId).delete()` (Line ~1832)

---

### 7. `applications`
Logs candidacy trackers, resume links, stage tags, and recruiter feedback.
*   **Document Structure**:
    ```typescript
    interface ApplicationDocument {
      id: string;                  // Generated app-* coordinates
      driveId: string;             // References jobs/internships document
      studentId: string;           // References students document
      studentName: string;
      studentEmail: string;
      branch: string;
      cgpa: number;
      companyName: string;
      jobRole: string;
      resumeUrl?: string;
      appliedAt: string;           // ISO 8601 string
      status: "applied" | "shortlisted" | "interviewing" | "offered" | "rejected";
      roundFeedback?: string;      // Optional recruiter notes
    }
    ```
*   **Read Paths**:
    *   `/api/applications` (Lines ~1870-1920) - Retrieve user applications ledger.
    *   `/api/applications/drives/:driveId` (Lines ~1925-1950) - Review applicant lists.
*   **Write Paths**:
    *   `/api/applications` (Lines ~1955-2020) - Post new job candidature.
    *   `/api/applications/:id/status` (Lines ~2025-2070) - Process recruitment rounds.

---

### 8. `notifications`
Supports target alert boards across all three student, recruiter, and TPO portals.
*   **Document Structure**:
    ```typescript
    interface NotificationDocument {
      id: string;                  // Unique message coordinates
      recipientId: string;         // Target user authentication link
      title: string;
      message: string;
      read: boolean;               // Standard read state tracker
      timestamp: string;           // ISO 8601 format string
    }
    ```
*   **Read Paths**:
    *   `/api/notifications` (Lines ~2150-2180) - Render inbox items.
*   **Write Paths**:
    *   `addNotification()` Core helper (Lines ~590-610) - Dispatches automated alerts.

---

### 9. `resumeAnalyses`
Stores the parsing results, compliance scores, missing keywords, and recommendations.
*   **Document Structure**:
    ```typescript
    interface ResumeScoreDocument {
      id: string;                  // Document coordinate
      studentId: string;
      score: number;               // Automated grading scope (1 - 100)
      skillsDetected: string[];
      skillsMissing: string[];
      suggestions: string[];
      parsedExperience?: string;
      analyzedAt: string;
    }
    ```
*   **Read Paths**:
    *   `/api/resume/score/:id` (Lines ~2870-2900) - View latest active grading.
*   **Write Paths**:
    *   `/api/resume/analyze` (Lines ~2905-2950) - Generate report card.

---

### 10. `interviews`
Governs interactive scheduled events, meets links, active stages, and evaluations.
*   **Document Structure**:
    ```typescript
    interface InterviewDocument {
      id: string;
      driveId: string;
      studentId: string;
      studentName: string;
      companyId: string;
      companyName: string;
      jobRole: string;
      date: string;                // Planned date
      time: string;                // Time bracket
      location: string;            // Meets Link or Room venue
      status: "scheduled" | "completed" | "cancelled";
      notes?: string;              // Optional assessment details
    }
    ```
*   **Read Paths**:
    *   `/api/interviews` (Lines ~2200-2240) - Calendar panel feeds.
*   **Write Paths**:
    *   `/api/interviews` (Lines ~2245-2290) - Schedule technical rounds.
    *   `/api/interviews/:id` (Lines ~2295-2330) - Cancel or update meeting status.

---

### 11. `verificationRequests`
Drives the compliance flows for students needing academic credentials cleared by TPO administrators.
*   **Document Structure**:
    ```typescript
    interface VerificationRequestDocument {
      id: string;                  // Target generated id coordinate
      studentId: string;
      studentName: string;
      studentEmail: string;
      submittedAt: string;
      status: "pending" | "verified" | "rejected";
      feedback?: string;
      decidedAt?: string;
      decidedBy?: string;          // TPO ID
    }
    ```
*   **Read Paths**:
    *   `/api/tpo/verification-requests` (Lines ~2400-2450) - Admin task feed.
*   **Write Paths**:
    *   `/api/students/verify/submit` (Lines ~2455-2480) - Student submission trigger.
    *   `/api/tpo/student/decide` (Lines ~2485-2530) - Admin decision processing.

---

## 📈 Logging Integration Verification

All adapter classes write clean, standardized validation lines to standard output whenever an operation executes:
```bash
[Firestore Log] READ SUCCESS | ProjectID: <campus-placements-live> | Collection: jobs | DocID: d-1718012015
[Firestore Log] WRITE SUCCESS | ProjectID: <campus-placements-live> | Collection: applications | DocID: app-401501
[Firestore Log] READ FAILURE | ProjectID: <campus-placements-live> | Collection: users | DocID: u-901 | Error: Permission Denied
```
This is fully configured and live-integrated into `/server.ts` data adapters!
