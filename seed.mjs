import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const db = getFirestore(app);

const jobs = [
  {
    companyId: "mock-company-google",
    companyName: "Google Cloud",
    jobRole: "SDE Intern (Security)",
    packageLPA: 24.5,
    branchEligibility: ["Computer Science", "Information Technology", "Electronics & Communication"],
    minimumCgpa: 8.5,
    allowedBacklogs: 0,
    jobDescription: "Join Google Cloud security team and build robust infrastructure.",
    skillsRequired: "React, Node.js, Security, GCP",
    driveDate: "2026-08-15T00:00:00Z",
    deadline: "2026-07-01T00:00:00Z",
    status: "active",
    type: "internship",
    location: "Bangalore",
    approvalStatus: "approved",
    source: "internal"
  },
  {
    companyId: "mock-company-razorpay",
    companyName: "Razorpay",
    jobRole: "Full Stack Engineer Intern",
    packageLPA: 18.0,
    branchEligibility: ["Computer Science", "Information Technology"],
    minimumCgpa: 8.0,
    allowedBacklogs: 1,
    jobDescription: "Work on highly scalable payment systems processing millions of transactions.",
    skillsRequired: "React, Node.js, PostgreSQL",
    driveDate: "2026-09-01T00:00:00Z",
    deadline: "2026-08-01T00:00:00Z",
    status: "active",
    type: "internship",
    location: "Bangalore",
    approvalStatus: "approved",
    source: "internal"
  },
  {
    companyId: "mock-company-openai",
    companyName: "OpenAI",
    jobRole: "AI Intern",
    packageLPA: 35.0,
    branchEligibility: ["Computer Science", "Electrical", "Mechanical"],
    minimumCgpa: 9.0,
    allowedBacklogs: 0,
    jobDescription: "Help build next-gen LLMs and advance artificial general intelligence.",
    skillsRequired: "Python, PyTorch, Machine Learning, NLP",
    driveDate: "2026-10-15T00:00:00Z",
    deadline: "2026-09-01T00:00:00Z",
    status: "active",
    type: "internship",
    location: "San Francisco / Remote",
    approvalStatus: "approved",
    source: "internal"
  },
  {
    companyId: "mock-company-adobe",
    companyName: "Adobe",
    jobRole: "Product Developer Intern",
    packageLPA: 15.0,
    branchEligibility: ["Computer Science", "Information Technology", "Electronics & Communication"],
    minimumCgpa: 8.2,
    allowedBacklogs: 0,
    jobDescription: "Build creative tools used by millions of designers worldwide.",
    skillsRequired: "C++, React, Algorithms",
    driveDate: "2026-09-10T00:00:00Z",
    deadline: "2026-08-15T00:00:00Z",
    status: "active",
    type: "internship",
    location: "Noida",
    approvalStatus: "approved",
    source: "internal"
  }
];

async function seed() {
  for (const job of jobs) {
    const id = "mock-drive-" + Math.random().toString(36).substring(7);
    await setDoc(doc(collection(db, "jobs"), id), { ...job, id });
    console.log("Inserted job:", job.companyName, job.jobRole);
  }
  console.log("Done seeding jobs!");
  process.exit(0);
}

seed().catch(console.error);
