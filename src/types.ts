export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'tpo' | 'company' | 'recruiter';
  name: string;
  isApproved: boolean; // TPO and Company need approval; student can be auto-approved or approved by TPO
  createdAt: string;
}

export interface StudentProfile {
  id: string; // Same as userId
  userId: string;
  email: string;
  collegeEmail?: string;
  name: string;
  personalEmail?: string;
  phone: string;
  gender?: string;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  
  enrollmentNumber?: string;
  branch: string;
  degree?: string;
  collegeName?: string;
  specialization?: string;
  currentYear?: string;
  graduationYear: string;
  cgpa: number;
  backlogs: number;
  tenthPercentage?: number;
  tenthBoard?: string;
  tenthYear?: string;
  twelfthPercentage?: number;
  twelfthBoard?: string;
  twelfthYear?: string;
  diplomaPercentage?: number;

  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  
  skills: string[];
  experience?: string[];
  photoUrl?: string; // Professional profile photo
  resumeUrl: string;
  resumeFileName: string;
  resumeScore: number;
  resumeAnalysis?: {
    atsScore: number;
    missingKeywords: string[];
    skillMatchScore: number;
    formattingScore: number;
    suggestions: string[];
    
    // Rich Parsed Data
    parsedName?: string;
    parsedEmail?: string;
    parsedPhone?: string;
    parsedEducation?: string[];
    parsedSkills?: string[];
    parsedProjects?: string[];
    parsedExperience?: string[];
    parsedCertifications?: string[];
    parsedAchievements?: string[];
    parsedLinks?: {
      linkedinUrl?: string;
      githubUrl?: string;
      portfolioUrl?: string;
    };

    // Rich Scores
    profileStrength?: number;
    skillDepth?: number;
    resumeHealth?: number;
    recruiterReadability?: number;

    // Advanced Insights
    skillGapAnalysis?: string;
    formattingReview?: string;
    projectRecommendations?: string[];
    certificationSuggestions?: string[];
    roleOptimization?: {
      sde?: { suitability: number; gaps: string[]; recommendation: string };
      aiml?: { suitability: number; gaps: string[]; recommendation: string };
      dataAnalyst?: { suitability: number; gaps: string[]; recommendation: string };
      fullStack?: { suitability: number; gaps: string[]; recommendation: string };
    };
  };
  
  profileCompleteness: number; // 0-100
  verificationStatus: 'draft' | 'completed' | 'pending' | 'verified' | 'rejected';
  feedback?: string;
  updatedAt?: string;
}

export interface TPOProfile {
  id: string; // Same as userId
  userId: string;
  email: string;
  name: string;
  phone: string;
  department: string;
}

export interface CompanyProfile {
  id: string; // Same as userId
  userId: string;
  email: string;
  name: string;
  description: string;
  website: string;
  isVerified: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  contactPerson: string;
  phone: string;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  jobRole: string;
  type: 'placement' | 'internship' | 'job';
  location: string;
  packageLPA: number; // LPA or monthly stipend
  branchEligibility: string[];
  minimumCgpa: number;
  allowedBacklogs: number;
  jobDescription: string;
  skillsRequired: string[];
  driveDate: string;
  applicationDeadline: string;
  status: 'active' | 'completed' | 'cancelled';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  postedBy: string; // userId of the recruiter or TPO
  recruiterDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  source: 'internal' | 'external';
  externalUrl?: string; // For discovery from web
  createdAt: string;
  matchPercentage?: number;
  matchReason?: string;
  skillGaps?: string[];
}

export interface MockInterviewSession {
  id: string;
  studentId: string;
  targetRole: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: string[];
  answers: { question: string; answer: string }[];
  evaluation?: {
    technicalScore: number;
    communicationScore: number;
    feedback: string;
    suggestions: string[];
  };
  createdAt: string;
}

export interface Application {
  id: string;
  driveId: string;
  companyId: string;
  companyName: string;
  jobRole: string;
  packageLPA: number;
  studentId: string; // userId of student
  studentName: string;
  studentEmail: string;
  studentBranch: string;
  studentCgpa: number;
  studentBacklogs: number;
  resumeUrl: string;
  studentPhotoUrl?: string;
  resumeScore: number;
  appliedDate: string;
  status: 'applied' | 'shortlisted' | 'interview_scheduled' | 'interview_completed' | 'selected' | 'rejected';
  feedback?: string;
  eligibilityExplanation?: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  driveId: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  jobRole: string;
  interviewDate: string;
  interviewTime: string;
  type: 'virtual' | 'in_person';
  linkOrVenue: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  timestamp: string;
}

export interface DashboardStatsStudent {
  appliedCount: number;
  interviewsCount: number;
  placementStatus: string; // 'Not Placed' | 'Applied' | 'Selected' | 'Rejected'
  resumeScore: number;
  profileCompleteness: number;
  verificationStatus: string;
  recommendedJobs: PlacementDrive[];
  notifications: Notification[];
}

export type Theme = 'light' | 'dark';

export interface DashboardStatsTPO {
  totalStudents: number;
  totalCompanies: number;
  totalDrives: number;
  placementPercentage: number;
  averagePackage: number;
  highestPackage: number;
  deptStats: { branch: string; total: number; placed: number; averageLpa: number }[];
  recentActivity: AuditLog[];
}

export interface DashboardStatsCompany {
  totalApplications: number;
  shortlistedCount: number;
  scheduledInterviews: number;
  offersReleased: number;
  applicantDistribution: { driveTitle: string; count: number }[];
}
