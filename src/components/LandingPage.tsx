import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  Sparkles, 
  Users, 
  CheckCircle, 
  Compass, 
  Mail, 
  User as UserIcon, 
  Phone, 
  BookOpen, 
  Building,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronDown,
  Info,
  ShieldCheck,
  UserCheck,
  Zap,
  Check,
  Star,
  Calendar,
  ArrowUpRight,
  BarChart2,
  Shield,
  Play,
  FileText,
  GraduationCap,
  Lock,
  Database,
  Eye,
  EyeOff,
  Filter,
  Activity,
  Award,
  ChevronRight,
  RotateCcw,
  Sun,
  Moon
} from "lucide-react";
import { 
  Brain, 
  Target, 
  Building2, 
  Rocket, 
  Globe, 
  Cpu, 
  BarChart3,
  Bell
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import PresentationDeck from "./PresentationDeck";
import { Theme } from "../types";
import { AnimatedCounter } from "./AnimatedCounter";

function useCounter(target: number, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setValue(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return value;
}

function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const v = useCounter(value, 2000, visible);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-gradient font-display">
        {v.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">{label}</div>
    </div>
  );
}

interface LandingPageProps {
  onLoginSuccess: (token: string, user: any, profile: any) => void;
  apiBaseUrl: string;
  theme: Theme;
  toggleTheme: () => void;
  initialAuthMode?: "login" | "register" | "forgot" | "otp" | "accessCode";
  initialTempIdToken?: string;
  initialTempEmail?: string;
  onCancelVerification?: () => void;
}

export default function LandingPage({ 
  onLoginSuccess, 
  apiBaseUrl, 
  theme, 
  toggleTheme,
  initialAuthMode,
  initialTempIdToken = "",
  initialTempEmail = "",
  onCancelVerification
}: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"landing" | "auth" | "presentation">(initialAuthMode ? "auth" : "landing");
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | "otp" | "accessCode">(initialAuthMode || "login");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempIdToken, setTempIdToken] = useState(initialTempIdToken);
  const [accessCode, setAccessCode] = useState("");

  // Active role theme configuration for the unified visual identity system
  const [roleTheme, setRoleTheme] = useState<"student" | "tpo" | "company">("student");

  // Form password and details
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "tpo" | "company">("student");
  
  // Registration metadata
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [branch, setBranch] = useState("Computer Science");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [department, setDepartment] = useState("Placement Cell");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  
  // Custom multi-step wizard properties
  const [authStep, setAuthStep] = useState<number>(1);
  const [tempUid, setTempUid] = useState("");
  const [tempEmail, setTempEmail] = useState(initialTempEmail || "");
  const [tempDisplayName, setTempDisplayName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [course, setCourse] = useState("B.Tech");
  const [companyLinkedin, setCompanyLinkedin] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  // Role Switch Live Preview Interactions state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState(0);
  const [cgpaFilter, setCgpaFilter] = useState(8.0);
  
  // Custom Recruitment board items for Recruiter interactive preview
  const [pipelineCandidates, setPipelineCandidates] = useState([
    { id: 1, name: "Pranav Sharma", cgpa: 9.2, ats: 96, status: "Vetted" },
    { id: 2, name: "Ananya Iyer", cgpa: 8.8, ats: 91, status: "Interviewing" },
    { id: 3, name: "Rohan Verma", cgpa: 8.5, ats: 89, status: "Vetted" },
    { id: 4, name: "Meera Nair", cgpa: 9.4, ats: 95, status: "Selected" }
  ]);

  // Handle move pipeline item
  const progressCandidate = (id: number) => {
    setPipelineCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "Vetted" ? "Interviewing" : (c.status === "Interviewing" ? "Selected" : "Vetted");
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  // Run ATS scan simulator
  const runFileScan = () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAtsScore(10);
    const interval = setInterval(() => {
      setAtsScore(prev => {
        if (prev >= 94) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 94;
        }
        return prev + 6;
      });
    }, 80);
  };

  // Testimonials database
  const testimonials = [
    {
      role: "student",
      name: "Rohan Sen",
      tag: "Vetted Software Engineer Intern",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
      quote: "The Resume Matcher worked like magic. By upgrading my score parameter to 94% using real-time skill alignment suggestions, I got matched and secured an interview with Google Cloud within a week!",
      glow: "from-[#3B82F6] to-[#22C55E]"
    },
    {
      role: "tpo",
      name: "Prof. Vinita Rao",
      tag: "TPO Officer - Delhi Tech Univ",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
      quote: "Managing CGPA and backlog restrictions via Google spreadsheets was a manual nightmare. CampusConnect AI automated the eligibility verification pipeline completely. We achieved 98% placement in 2 weeks.",
      glow: "from-[#6366F1] to-[#A855F7]"
    },
    {
      role: "company",
      name: "Meghan Vance",
      tag: "Talent Acquisition - Razorpay",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
      quote: "Instead of shifting through millions of unverified PDF CV cards, we targeted top-vetted profiles based on direct verified academic cgpa filters on CampusConnect. Sourcing costs dropped by 70%.",
      glow: "from-[#06B6D4] to-[#2563EB]"
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Automatic slide cycle for Testimonials Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Theme configuration details mapped by active role selections
  const config = {
    student: {
      colorGrad: "from-blue-600 to-emerald-500",
      accentBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      accentBorder: "border-emerald-500/30",
      glowColor: "shadow-emerald-500/10",
      badgeText: "Student Mode Active",
      accentHex: "#22C55E"
    },
    tpo: {
      colorGrad: "from-indigo-600 to-purple-500",
      accentBg: "bg-purple-500/11 text-purple-400 border-purple-500/20",
      accentBorder: "border-purple-500/30",
      glowColor: "shadow-purple-500/10",
      badgeText: "TPO/Admin Mode Active",
      accentHex: "#A855F7"
    },
    company: {
      colorGrad: "from-cyan-500 to-blue-600",
      accentBg: "bg-blue-500/11 text-blue-400 border-blue-500/20",
      accentBorder: "border-blue-500/30",
      glowColor: "shadow-blue-500/10",
      badgeText: "Recruiter Mode Active",
      accentHex: "#06B6D4"
    }
  }[roleTheme];

  // Auth processing strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, text: "Required", color: "bg-slate-250" };
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score, text: "Weak ⚠️", color: "bg-red-400" };
    if (score === 2) return { score, text: "Fair ⚠️", color: "bg-amber-400" };
    if (score === 3) return { score, text: "Good 👍", color: "bg-blue-500" };
    return { score, text: "Excellent 💪", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  // Reusable fetch JSON helper that avoids "Unexpected token '<', '<html>...'" errors
  const fetchJson = async (url: string, options: RequestInit) => {
    console.log(`[Auth] Fetching: ${url}`, options.method);
    let res;
    try {
      res = await fetch(url, options);
    } catch (netErr) {
      console.error("[Auth] Fetch error:", netErr);
      throw new Error("Unable to connect to the server. Please check your network connection and try again.");
    }

    console.log(`[Auth] Response status: ${res.status}`);
    let data: any = {};
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("[Auth] JSON parse error:", jsonErr);
      }
    } else {
      try {
        const text = await res.text();
        console.log(`[Auth] Non-JSON response body snippet: ${text.substring(0, 100)}`);
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            console.warn("Response body is not JSON:", text.substring(0, 200));
          }
        }
      } catch (err) {}
    }

    if (!res.ok) {
      console.error("[Auth] Error data received:", data);
      if (data && data.error) {
        const errLower = data.error.toLowerCase();
        if (
          errLower.includes("already registered") || 
          errLower.includes("already have an account") || 
          errLower.includes("already exists") || 
          errLower.includes("email-already-in-use")
        ) {
          throw new Error("Your email is already registered.");
        }
        if (
          errLower.includes("invalid login credentials") ||
          errLower.includes("wrong password") ||
          errLower.includes("user-not-found") ||
          errLower.includes("wrong-password")
        ) {
          throw new Error("Invalid login credentials. Please check your registered email or password, and make sure you are using the correct portal.");
        }
        if (res.status === 403) {
          throw new Error(data.error || "You’re signed in, but this portal is not available for your role. Please switch to your assigned role.");
        }
        throw new Error(data.error);
      }
      if (res.status === 403) {
        throw new Error("You’re signed in, but this portal is not available for your role. Please switch to your assigned role.");
      }
      if (res.status === 404) {
        throw new Error("The requested service is temporarily unavailable. Please try again soon.");
      } else if (res.status === 500) {
        throw new Error("An internal server error occurred. Please try again later.");
      } else {
        throw new Error(`Server error (${res.status}). Please try again.`);
      }
    }

    return data || {};
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const firebaseUid = result.user.uid;
      const firebaseEmail = result.user.email || "";
      const firebaseName = result.user.displayName || "";

      // Fetch session tokens from backend directly
      let data = null;
      let noAccount = false;
      try {
        data = await fetchJson(`${apiBaseUrl}/api/auth/login-firebase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken })
        });
      } catch (err: any) {
        if (err.message && (err.message.includes("No account found") || err.message.includes("register first"))) {
          noAccount = true;
        } else {
          throw err;
        }
      }

      if (!noAccount && data) {
        if (data.accessCodeRequired) {
          setTempIdToken(idToken);
          setTempEmail(data.email);
          setAuthMode("accessCode");
          setSuccess(data.message || "Administrative checkpoint. Please enter your 6-digit access code.");
          return;
        }

        if (data.token) {
          setSuccess("Welcome back, logging in...");
          onLoginSuccess(data.token, data.user, data.profile);
        } else {
          throw new Error("Server error: Missing session token.");
        }
      } else {
        // No Firestore profile exists yet for this UID. Transition them to completing onboarding/registration!
        setTempUid(firebaseUid);
        setTempEmail(firebaseEmail);
        setTempDisplayName(firebaseName);
        setName(firebaseName);
        setAuthMode("register");
        setAuthStep(2);
        setSuccess("Connected with Google! Let's set up your placement portal workspace profile.");
      }
    } catch (err: any) {
      console.error("[Auth] Google Sign-In details failed:", err);
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        setError("Sign-in was cancelled. Please try again or use email login.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please enable popups and try again.");
      } else if (err.code === "auth/unauthorized-domain" || err.message?.includes("unauthorized-domain") || String(err).includes("unauthorized-domain")) {
        setError("unauthorized-domain|The domain of this application is not yet authorized in your Firebase console. To fix this, please add the hostnames below under Authentication -> Settings -> Authorized Domains in the Firebase Console. In the meantime, you can sign in/register instantly using direct password credentials below, which bypasses domain verification!");
      } else {
        setError(err.message || "Google auth session has been cancelled.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit verification code.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchJson(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: tempUid, otp })
      });

      if (data && data.token) {
        setSuccess("OTP Verified successfully! Logging in...");
        onLoginSuccess(data.token, data.user, data.profile);
      } else {
        throw new Error(data?.error || "Incorrect or expired verification code.");
      }
    } catch (err: any) {
      console.error("[OTP] Verification failed:", err);
      setError(err.message || "Failed to verify security activation code.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!accessCode || accessCode.length !== 6) {
      setError("Please enter a valid 6-digit administrative access code.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchJson(`${apiBaseUrl}/api/auth/verify-access-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: tempIdToken, uid: tempUid, accessCode })
      });

      if (data && data.token) {
        setSuccess("Clearance level verified! Accessing administrative console...");
        onLoginSuccess(data.token, data.user, data.profile);
      } else {
        throw new Error(data?.error || "Incorrect security access code.");
      }
    } catch (err: any) {
      console.error("[AccessCode] Verification failed:", err);
      setError(err.message || "Failed to verify administrative access level.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (authMode === "register" && password !== confirmPassword) {
      setError("Confirm password must exactly match the password field.");
      setLoading(false);
      return;
    }

    if (authMode === "login" || authMode === "forgot") {
      try {
        const checkRes = await fetch(`${apiBaseUrl}/api/auth/check-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() })
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (!checkData.exists || (!checkData.hasFirestoreProfile && email.trim().toLowerCase() !== "tpo01admin@gmail.com")) {
            setError("no-account-found");
            setLoading(false);
            return;
          }
          if (checkData.exists && checkData.providers) {
            const hasGoogle = checkData.providers.includes("google.com");
            const hasPassword = checkData.providers.includes("password");
            const isTpoAdmin = email.trim().toLowerCase() === "tpo01admin@gmail.com";
            
            if (hasGoogle && !hasPassword && !isTpoAdmin) {
              // We do not block manual password attempts early. Allow users to enter a password and try to log in,
              // or let the backend return the password reset option if no local password exists yet.
              console.log("[Auth] Google account exists, allowing manual login attempt...");
            }
          }
        }
      } catch (err) {
        console.warn("Could not verify Google auth status via endpoint:", err);
      }
    }

    try {
      if (authMode === "login") {
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (firebaseErr: any) {
          console.warn("Firebase email auth mismatch. Running fallback login check:");
          // Fallback check against backend Manual DB
          let localData;
          try {
            localData = await fetchJson(`${apiBaseUrl}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password })
            });
          } catch (fetchErr: any) {
            throw new Error(fetchErr.message || "Invalid email/password.");
          }

          if (localData && localData.accessCodeRequired) {
            setTempUid(localData.uid);
            setTempEmail(localData.email);
            setAuthMode("accessCode");
            setSuccess(localData.message || "Administrative access checkpoint. Please enter your 6-digit access code.");
            return;
          }
          if (localData && localData.otpRequired) {
            setTempUid(localData.uid);
            setTempEmail(localData.email);
            setAuthMode("otp");
            setSuccess(localData.message || "A 6-digit verification code has been generated and sent to your registered email address.");
            return;
          }
          if (localData && localData.token) {
            onLoginSuccess(localData.token, localData.user, localData.profile);
            return;
          } else if (localData && localData.error) {
            throw new Error(localData.error);
          } else {
            throw new Error("Invalid email/password.");
          }
        }

        const firebaseUid = userCredential.user.uid;
        const idToken = await userCredential.user.getIdToken();
        
        let data;
        let noAccount = false;
        try {
          data = await fetchJson(`${apiBaseUrl}/api/auth/login-firebase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken })
          });
        } catch (fetchErr: any) {
          if (fetchErr.message && (fetchErr.message.includes("No account found") || fetchErr.message.includes("register first"))) {
            noAccount = true;
          } else {
            throw new Error(fetchErr.message || "Invalid email/password.");
          }
        }

        if (!noAccount && data) {
          if (data && data.accessCodeRequired) {
            setTempIdToken(idToken);
            setTempEmail(data.email);
            setAuthMode("accessCode");
            setSuccess(data.message || "Administrative access checkpoint. Please enter your 6-digit access code.");
            return;
          }
          if (data && data.otpRequired) {
            setTempUid(data.uid);
            setTempEmail(data.email);
            setAuthMode("otp");
            setSuccess(data.message || "A 6-digit verification code has been generated and sent to your registered email address.");
            return;
          }
          if (data && data.token) {
            onLoginSuccess(data.token, data.user, data.profile);
          } else if (data && data.error) {
            throw new Error(data.error);
          } else {
            throw new Error("Server error: Missing session token.");
          }
        } else {
          // Firebase account exists but no Firestore profile yet
          setTempUid(firebaseUid);
          setTempEmail(email);
          setAuthStep(2);
        }
      } else if (authMode === "register") {
        // Enforce existing account pre-check before signup
        try {
          const checkRes = await fetch(`${apiBaseUrl}/api/auth/check-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase() })
          });
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.exists) {
              throw new Error("This email is already registered.");
            }
          }
        } catch (checkErr: any) {
          if (checkErr.message === "This email is already registered.") {
            throw checkErr;
          }
          console.warn("Could not sweep registry before register:", checkErr);
        }

        let userCredential;
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          try {
            await sendEmailVerification(userCredential.user);
          } catch (verifErr) {}
        } catch (firebaseErr: any) {
          console.error("[Auth] Firebase createUserWithEmailAndPassword failed:", firebaseErr);
          if (firebaseErr?.code === "auth/email-already-in-use") {
            throw new Error("This email is already registered.");
          } else {
            throw new Error(firebaseErr.message || "Failed to create authentication credentials.");
          }
        }

        // Firebase Auth account created successfully! Transition to selection
        const firebaseUid = userCredential.user.uid;
        setTempUid(firebaseUid);
        setTempEmail(email);
        setAuthStep(2);
      } else if (authMode === "forgot") {
        try {
          await sendPasswordResetEmail(auth, email);
          setSuccess("A password reset link was sent to your email.");
        } catch (firebaseErr: any) {
          console.warn("Local database credential override engaged.");
          await fetchJson(`${apiBaseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword: password })
          });
          setSuccess("Password modified successfully in our recovery logs.");
        }
        setAuthMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      console.error("[Auth] Authentication failed:", err);
      setError(err.message || "Authorization failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!name) {
      setError("Please provide your full legal name.");
      setLoading(false);
      return;
    }

    if (role === "student") {
      if (!enrollmentNumber || !branch || !course || !graduationYear) {
        setError("Please complete all required student fields.");
        setLoading(false);
        return;
      }
    } else if (role === "company") {
      const activeCompanyEmail = companyEmail || tempEmail;
      if (!companyName || !activeCompanyEmail || !companyWebsite || !phone) {
        setError("Please complete all required recruiter fields.");
        setLoading(false);
        return;
      }
    }

    const assignedRole = role === "student" ? "student" : "recruiter";
    const statusForApp = role === "student" ? "verified" : "pending_verification";

    console.log(`[Onboarding Submit] Form clicked. Preparing physical Firestore document persistence for UID: ${tempUid}`);
    console.log(`[Onboarding Submit] Unique Identity key used: ${tempUid}`);
    console.log(`[Onboarding Submit] Input email parameters: ${tempEmail}`);
    console.log(`[Onboarding Submit] Resolved Role Assignment: ${assignedRole}`);
    console.log(`[Onboarding Submit] Initial Registration Status: ${statusForApp}`);

    try {
      const payload = {
        uid: tempUid,
        email: tempEmail,
        role: assignedRole,
        name,
        phone,
        branch: role === "student" ? branch : undefined,
        graduationYear: role === "student" ? graduationYear : undefined,
        course: role === "student" ? course : undefined,
        enrollmentNumber: role === "student" ? enrollmentNumber : undefined,
        companyDescription: role === "company" ? companyDescription : undefined,
        companyWebsite: role === "company" ? companyWebsite : undefined,
        companyName: role === "company" ? companyName : undefined,
        companyLinkedin: role === "company" ? companyLinkedin : undefined,
        companyEmail: role === "company" ? (companyEmail || tempEmail) : undefined,
      };

      console.log(`[Onboarding Submit] Dispatching register API write handler as ${assignedRole} for UID ${tempUid}`);

      // Call registration API - Writes all Firestore documents in single transaction (users/{uid}, etc.)
      const registerRes = await fetchJson(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!registerRes.success) {
        throw new Error(registerRes.error || "Profile initialization failed.");
      }

      // If the API directly returned the JWT token and profile, log in immediately and seamlessly
      if (registerRes.token) {
        console.log(`[Onboarding Submit] Seamless direct JWT login succeeded. Routing candidate: ${tempUid}`);
        onLoginSuccess(registerRes.token, registerRes.user, registerRes.profile);
        return;
      }

      console.log(`[Onboarding Submit] Firestore documents successfully saved. Created entries in users/${tempUid}, and role profiles.`);
      setSuccess("Account activated! Authenticating portal session...");

      // Instantly generate the jwt session via login-firebase as fallback
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        const loginData = await fetchJson(`${apiBaseUrl}/api/auth/login-firebase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken, role: assignedRole })
        });

        if (loginData && loginData.accessCodeRequired) {
          setTempIdToken(idToken);
          setTempEmail(loginData.email);
          setAuthMode("accessCode");
          setSuccess(loginData.message || "Administrative access checkpoint. Please enter your 6-digit access code.");
          return;
        }

        if (loginData && loginData.otpRequired) {
          setTempUid(loginData.uid);
          setTempEmail(loginData.email);
          setAuthMode("otp");
          setSuccess(loginData.message || "A 6-digit verification code has been generated and sent to your registered email address.");
          return;
        }

        if (loginData && loginData.token) {
          console.log(`[Onboarding Submit] Auto-login succeeded seamlessly via Firebase. Access token emitted. Routing candidate: ${tempUid}`);
          onLoginSuccess(loginData.token, loginData.user, loginData.profile);
          return;
        }
      }

      // Secondary fallback: manual authentication against /api/auth/login if secure credentials are local
      if (tempEmail && password) {
        try {
          const loginData = await fetchJson(`${apiBaseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: tempEmail, password, role: assignedRole })
          });
          if (loginData && loginData.otpRequired) {
            setTempUid(loginData.uid);
            setTempEmail(loginData.email);
            setAuthMode("otp");
            setSuccess(loginData.message || "A 6-digit verification code has been generated and sent to your registered email address.");
            return;
          }
          if (loginData && loginData.token) {
            console.log(`[Onboarding Submit] Seamless auto-login fallback succeeded using credentials. Routing candidate: ${tempUid}`);
            onLoginSuccess(loginData.token, loginData.user, loginData.profile);
            return;
          }
        } catch (loginErr) {
          console.error("[Onboarding Submit] Fallback local login also failed:", loginErr);
        }
      }

      // Under all other circumstances, gracefully guide the user to the login step instead of throwing an aggressive enroller error
      setSuccess("Onboarding complete. Please sign in to access your dashboard.");
      setAuthStep(1);
      setAuthMode("login");
    } catch (err: any) {
      console.error("[Onboarding] Registration submission error:", err);
      setError(err.message || "Failed to finalize registration profile.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#030408] text-slate-100' : 'bg-[#f8fafc] text-slate-900'} flex flex-col font-sans overflow-x-hidden ${isDark ? 'selection:bg-indigo-900/40' : 'selection:bg-indigo-100'}`} id="campusconnect-main-landing">
      {/* High impact grid pattern background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-[#030408] bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)]' : 'bg-[#f8fafc] bg-[linear-gradient(to_right,#0f172a04_1px,transparent_1px),linear-gradient(to_bottom,#0f172a04_1px,transparent_1px)]'} bg-[size:40px_40px] pointer-events-none`}></div>

      {/* Dynamic Animated Cosmic Background Gradients */}
      <div className={`absolute top-[-100px] right-[-105px] w-[600px] h-[600px] rounded-full blur-[130px] pointer-events-none ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-500/5'}`} />
      <div className={`absolute top-[800px] left-[-200px] w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${isDark ? 'bg-blue-500/5' : 'bg-blue-500/3'}`}></div>

      {/* FLOATING PILL HEADER SECTION */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-6">
        <header className={`max-w-7xl mx-auto rounded-full ${isDark ? 'bg-[#07090e]/80 border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.7)]' : 'bg-white/85 border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.08)]'} backdrop-blur-xl border px-6 py-3.5 flex items-center justify-between`} id="cc-main-header">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("landing")}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mr-1 shadow-[0_4px_12px_rgba(168,85,247,0.3)]">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`text-sm font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} block`}>
                CampusConnect <span className="text-[#a855f7] font-semibold text-xs ml-0.5">AI</span>
              </span>
              <span className={`text-[8px] font-extrabold ${isDark ? 'text-indigo-400' : 'text-indigo-605'} tracking-wider uppercase block`}>AI PLACEMENT PORTAL</span>
            </div>
          </div>
          
          <nav className={`hidden md:flex items-center space-x-8 text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider`}>
            <a href="#features" className={`hover:text-indigo-550 hover:text-indigo-500 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`} onClick={() => setActiveTab("landing")}>Features</a>
            <a href="#dashboards" className={`hover:text-indigo-550 hover:text-indigo-500 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`} onClick={() => setActiveTab("landing")}>Dashboards</a>
            <a href="#how-it-works" className={`hover:text-indigo-550 hover:text-indigo-500 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`} onClick={() => setActiveTab("landing")}>Workflow</a>
            <a href="#about" className={`hover:text-indigo-550 hover:text-indigo-500 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`} onClick={() => setActiveTab("landing")}>About</a>
            <a href="#contact" className={`hover:text-indigo-550 hover:text-indigo-500 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors`} onClick={() => { setActiveTab("landing"); setTimeout(() => document.getElementById("cc-main-footer")?.scrollIntoView({ behavior: "smooth" }), 150); }}>Contact</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDark ? 'bg-slate-900/60 border-white/[0.08] text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'} border transition shadow-sm`}
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
            <button 
              onClick={() => { setAuthMode("login"); setAuthStep(1); setActiveTab("auth"); setRole(roleTheme === "tpo" ? "student" : roleTheme); setError(""); }}
              className={`px-3.5 py-2 text-xs font-bold ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors`}
            >
              Sign In
            </button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setAuthMode("register"); setAuthStep(1); setActiveTab("auth"); setRole(roleTheme === "tpo" ? "student" : roleTheme); setError(""); }}
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 active:scale-95 text-white font-extrabold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_4px_24px_rgba(99,102,241,0.3)]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 text-white stroke-[3]" />
            </motion.button>
          </div>
        </header>
      </div>

      {/* MAIN LAYOUTS */}
      <main className="flex-1">
        {activeTab === "presentation" ? (
          <PresentationDeck onExit={() => setActiveTab("landing")} />
        ) : activeTab === "landing" ? (
          <div className="animate-fade-in">
            
            {/* 1. HERO SECTION */}
            <section className="relative pt-44 pb-20 px-6 sm:px-12 overflow-hidden">
              <div className={`absolute top-32 left-10 w-72 h-72 rounded-full opacity-[0.12] blur-3xl animate-glow-pulse ${isDark ? 'bg-purple-600' : 'bg-purple-400'}`} />
              <div className={`absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-[0.08] blur-3xl animate-glow-pulse ${isDark ? 'bg-cyan-500' : 'bg-cyan-400'}`} style={{ animationDelay: "2s" }} />

              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-up text-left space-y-6">
                  <div className={`inline-flex items-center gap-2 rounded-full border ${isDark ? 'border-white/[0.08] bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-white/80 text-slate-600'} backdrop-blur-md px-4 py-2 text-xs font-semibold shadow-sm`}>
                    <span className="w-2 h-2 rounded-full animate-glow-pulse bg-emerald-400" />
                    <span>Now live for 200+ institutions</span>
                  </div>
                  <h1 className={`text-5xl sm:text-6xl md:text-[5.5rem] font-black leading-[1.05] ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                    The future of <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-black">campus</span> <span className="bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-black">placements</span> is intelligent.
                  </h1>
                  <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-xl leading-relaxed font-semibold`}>
                    CampusConnect AI unifies students, recruiters, and placement officers through smart automation —
                    from resume analysis to offer letters, all in one beautifully orchestrated platform.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => { setAuthMode("register"); setActiveTab("auth"); setRole(roleTheme); setError(""); }}
                      className="bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 hover:brightness-110 text-black font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_24px_rgba(6,182,212,0.3)] duration-200"
                    >
                      Launch Platform <Rocket className="w-4 h-4 text-black stroke-[2.5]" />
                    </button>
                    <a href="#demo" className={`rounded-full border ${isDark ? 'border-white/[0.08] bg-[#07090e]/40 hover:bg-slate-900/60 text-white' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm'} backdrop-blur-md font-extrabold px-8 py-3.5 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all`}>
                      Watch Demo <ChevronRight className="w-4 h-4 text-slate-400" />
                    </a>
                  </div>
                </div>

                <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  <div className={`relative p-2 rounded-[2rem] bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-fuchsia-500/10 border ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                    <div className="absolute inset-0 blur-3xl opacity-40 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 rounded-full" />
                    <img 
                      referrerPolicy="no-referrer"
                      src="/assets/hero-ai.jpg" 
                      alt="AI neural network brain illustration" 
                      width={1536} 
                      height={1024}
                      className={`relative rounded-3xl border ${isDark ? 'border-white/10' : 'border-slate-200'} shadow-2xl w-full`} 
                    />
                  </div>
                  {/* Floating glass cards exactly like Image 1 */}
                  <div className={`absolute -left-6 top-10 rounded-2xl ${isDark ? 'bg-[#090b14]/75 border-white/[0.08] text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200/80 text-slate-850 shadow-lg'} backdrop-blur-xl p-4 w-56 animate-float hidden md:block text-left`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-cyan-500 to-sky-400 shadow-lg shadow-cyan-500/10">
                        <Brain className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Resume Score</div>
                        <div className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>92 / 100</div>
                      </div>
                    </div>
                  </div>
                  <div className={`absolute -right-4 bottom-16 rounded-2xl ${isDark ? 'bg-[#090b14]/75 border-white/[0.08] text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-200/80 text-slate-850 shadow-lg'} backdrop-blur-xl p-4 w-60 animate-float hidden md:block text-left`} style={{ animationDelay: "2s" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-violet-500 to-pink-500 shadow-lg shadow-purple-500/15">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Match Found</div>
                        <div className="font-extrabold text-[#22d3ee] text-xs">Google · SDE Intern</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. STATS & LOGOS SECTION */}
            <section className="py-16 px-6 bg-transparent relative">
              <div className="max-w-6xl mx-auto space-y-16">
                
                {/* 3 Indicators directly from Image 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto text-center">
                  <div className="space-y-1">
                    <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-fuchsia-400 to-pink-500 bg-clip-text text-transparent font-sans tracking-tight">
                      <AnimatedCounter to={94} suffix="%" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Placement Rate</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent font-sans tracking-tight">
                      <AnimatedCounter to={1200} suffix="+" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Recruiters</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 bg-clip-text text-transparent font-sans tracking-tight">
                      <AnimatedCounter to={45000} suffix="+" />
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">Students</div>
                  </div>
                </div>

                {/* Company Logo Row inside central floating dark pill */}
                <div className="space-y-6">
                  <p className="text-center text-[10px] uppercase tracking-[0.3em] font-mono font-black text-slate-500">
                    Trusted by recruiters from world-class companies
                  </p>
                  <div className={`rounded-2xl ${isDark ? 'bg-[#090b11]/80 border-white/[0.04]' : 'bg-white border-slate-200 shadow-xs'} backdrop-blur-md border p-6 max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-4`}>
                    {["Google", "Microsoft", "Amazon", "Meta", "Adobe", "Stripe", "Atlassian", "Oracle"].map((l) => (
                      <span key={l} className={`font-display font-semibold text-lg text-slate-400 ${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition cursor-pointer`}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </section>

            {/* 3. PROBLEM SECTION */}
            <section className="py-20 px-6 bg-transparent" id="about">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
                  <div className={`inline-block rounded-full border ${isDark ? 'border-white/[0.08] bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'} px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-widest`}>The Problem</div>
                  <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'} leading-tight tracking-tight`}>Traditional placements are <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">broken</span>.</h2>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm sm:text-base leading-relaxed font-semibold`}>Email threads, Excel sheets, and last-minute WhatsApp groups can't scale to thousands of students and hundreds of recruiters.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    { icon: FileText, title: "Manual resume screening", desc: "TPOs drown in spreadsheets and slow email validation loops.", color: "text-red-400 bg-red-500/10 border-red-500/20" },
                    { icon: Calendar, title: "Scheduling chaos", desc: "Drives clash, slots overlap, and students get notified way too late.", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                    { icon: ShieldCheck, title: "Eligibility errors", desc: "CGPA barriers and backlog rules checked by hand—costing premium offers.", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                    { icon: BarChart3, title: "Zero visibility", desc: "No central real-time statistics or funnels to guide placement decisions.", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
                  ].map((p) => (
                    <div key={p.title} className={`rounded-2xl ${isDark ? 'bg-[#090b14] border-white/[0.05]' : 'bg-white border-slate-200 shadow-xs'} border p-6 text-left hover:-translate-y-1 transition-all duration-300`}>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${p.color}`}>
                        <p.icon className="w-5 h-5" />
                      </div>
                      <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>{p.title}</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold leading-relaxed`}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. PLATFORM PILLARS OF AUTOMATION */}
            <section id="features" className="py-24 px-6 relative bg-transparent">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
                  <div className={`inline-block rounded-full border ${isDark ? 'border-white/[0.08] bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-600'} px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-widest`}>Platform</div>
                  <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'} leading-tight tracking-tight`}>Everything you need, <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">intelligently connected</span>.</h2>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm sm:text-base leading-relaxed font-semibold`}>Six pillars of automation, designed to orchestrate campus recruitment at scale.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { icon: Brain, title: "AI Resume Analysis", desc: "Deep parsing extracts skills, projects, and gaps — with actionable improvement scores.", glow: "group-hover:border-purple-500/30", iconBg: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                    { icon: Target, title: "Smart Job Matching", desc: "Vector neural embeddings match student profiles to roles by technical skills and focus areas.", glow: "group-hover:border-cyan-500/30", iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
                    { icon: ShieldCheck, title: "Automated Eligibility", desc: "CGPA, branch limits, and past backlogs vetted immediately across massive student groups.", glow: "group-hover:border-indigo-500/30", iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
                    { icon: BarChart3, title: "Placement Analytics", desc: "Real-time interactive dashboard reporting live offer packages, conversion funnels, and demographics.", glow: "group-hover:border-pink-500/30", iconBg: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
                    { icon: Calendar, title: "Interview Management", desc: "Coordinate multi-round schedules automatically, synchronize panel calendars, and sync logs.", glow: "group-hover:border-blue-500/30", iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
                    { icon: Bell, title: "Real-Time Notifications", desc: "Instant automated alerts via direct email, push channels, and SMS updates.", glow: "group-hover:border-emerald-500/30", iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                  ].map((f, i) => (
                    <div key={f.title} className={`group rounded-2xl ${isDark ? 'bg-[#090b14]/90 border-white/[0.04]' : 'bg-white border-slate-200 shadow-xs'} border p-7 transition-all duration-350 text-left relative overflow-hidden ${f.glow}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${f.iconBg}`}>
                        <f.icon className="w-6 h-6" />
                      </div>
                      <h3 className={`text-sm sm:text-base font-extrabold ${isDark ? 'text-white' : 'text-slate-850'} mb-2`}>{f.title}</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold leading-relaxed`}>{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. ROLE-BASED DASHBOARDS SECTION */}
            <section id="dashboards" className={`py-24 px-6 text-center bg-transparent relative border-t ${isDark ? 'border-white/[0.05]' : 'border-slate-200/80'}`}>
              <div className="max-w-7xl mx-auto space-y-16">
                
                <div className="text-center max-w-2xl mx-auto space-y-4">
                  <div className={`inline-block rounded-full border ${isDark ? 'border-[#a855f7]/20 bg-slate-900/60' : 'border-purple-200 bg-purple-50'} px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-widest text-[#a855f7]`}>Role-Based Dashboards</div>
                  <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-slate-900'} leading-tight tracking-tight`}>One platform, <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">three perspectives</span>.</h2>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm leading-relaxed font-semibold max-w-lg mx-auto`}>
                    An optimized experience tailored precisely to the goals of students, placement directors, and talent acquisition teams.
                  </p>
                </div>

                {/* Dashboard Screenshot Mockup with custom glowing aura */}
                <div className="relative max-w-5xl mx-auto">
                  <div className="absolute inset-[-4px] blur-3xl opacity-30 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 rounded-[2.5rem] pointer-events-none" />
                  <div className={`relative rounded-[2.2rem] p-2 ${isDark ? 'bg-[#05070c] border-white/[0.1]' : 'bg-slate-100 border-slate-300'} shadow-2xl overflow-hidden`}>
                    <img 
                      referrerPolicy="no-referrer"
                      src="/assets/dashboard-preview.jpg" 
                      alt="Comprehensive System Dashboard Portal Preview Layout" 
                      loading="lazy" 
                      width={1536} 
                      height={1024}
                      className={`w-full rounded-[1.8rem] border ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`} 
                    />
                  </div>
                </div>

                {/* Three precise structural columns from Image 6 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left max-w-6xl mx-auto">
                  
                  {/* Student */}
                  <div className={`p-6.5 rounded-2xl border transition duration-300 space-y-4 ${isDark ? 'bg-[#090b14] border-cyan-500/10 hover:border-cyan-500/25' : 'bg-white border-slate-200 hover:border-cyan-200 shadow-xs'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-sm">
                        <Users className="w-5 h-5" />
                      </div>
                      <h4 className={`font-extrabold ${isDark ? 'text-[#f1f5f9]' : 'text-slate-800'} tracking-tight`}>Student Portal</h4>
                    </div>
                    <ul className={`space-y-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <span>Personalized role discovery</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <span>Real-time application tracking</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <span>Instant AI ATS resume coach</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                        <span>Mock interviews & test preps</span>
                      </li>
                    </ul>
                  </div>

                  {/* TPO / Admin */}
                  <div className={`p-6.5 rounded-2xl border transition duration-300 space-y-4 ${isDark ? 'bg-[#090b14] border-purple-500/10 hover:border-purple-500/25' : 'bg-white border-slate-200 hover:border-purple-200 shadow-xs'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h4 className={`font-extrabold ${isDark ? 'text-[#f1f5f9]' : 'text-slate-800'} tracking-tight`}>Placement Cell (TPO)</h4>
                    </div>
                    <ul className={`space-y-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        <span>Drive scheduler engine</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        <span>Automatic criteria filter controls</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        <span>Unified recruiter CRM hub</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        <span>Academic compliance reporting</span>
                      </li>
                    </ul>
                  </div>

                  {/* Company / Recruiter */}
                  <div className={`p-6.5 rounded-2xl border transition duration-300 space-y-4 ${isDark ? 'bg-[#090b14] border-[#a855f7]/10 hover:border-[#a855f7]/25' : 'bg-white border-slate-200 hover:border-pink-200 shadow-xs'}`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shadow-sm">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <h4 className={`font-extrabold ${isDark ? 'text-[#f1f5f9]' : 'text-slate-800'} tracking-tight`}>Recruiter Suite</h4>
                    </div>
                    <ul className={`space-y-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-semibold`}>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                        <span>Highly targeted talent sourcing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                        <span>AI screening & shortlist tools</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                        <span>Candidate pipeline automation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                        <span>Custom employer branding spaces</span>
                      </li>
                    </ul>
                  </div>

                </div>

              </div>
            </section>

            {/* 5B. INTERACTIVE SANDBOX DEMO */}
            <section className={`py-24 bg-transparent px-6 border-t border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200/80'}`} id="demo">
              <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                  <span className={`text-[10px] font-bold ${isDark ? 'text-indigo-400 bg-indigo-900/20 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 border-indigo-200'} py-1.5 px-3.5 rounded-full inline-block border font-mono`}>
                    ACTIVE SANDBOX
                  </span>
                  <h2 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight`}>
                    Switch Roles to Experience the Portal
                  </h2>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-xs sm:text-sm font-semibold`}>
                    The platform morphs completely—reconstituting state engines, theme accents, and dynamic features to match each portal user.
                  </p>
                </div>

                {/* Simulated Tab controls matching dark theme */}
                <div className={`flex justify-center p-1.5 ${isDark ? 'bg-slate-900 border-white/[0.08]' : 'bg-slate-100 border-slate-200'} rounded-2xl max-w-md mx-auto border shadow-inner mb-12`}>
                  <button 
                    onClick={() => setRoleTheme("student")}
                    className={`flex-1 text-xs font-bold py-3.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${roleTheme === "student" ? `${isDark ? 'bg-slate-800 border-white/[0.05]' : 'bg-white border-slate-200/80 shadow'} text-emerald-500 font-extrabold border` : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}`}
                  >
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                    <span>Student</span>
                  </button>
                  <button 
                    onClick={() => setRoleTheme("tpo")}
                    className={`flex-1 text-xs font-bold py-3.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${roleTheme === "tpo" ? `${isDark ? 'bg-slate-800 border-white/[0.05]' : 'bg-white border-slate-200/80 shadow'} text-purple-500 font-extrabold border` : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}`}
                  >
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>TPO / Admin</span>
                  </button>
                  <button 
                    onClick={() => setRoleTheme("company")}
                    className={`flex-1 text-xs font-bold py-3.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${roleTheme === "company" ? `${isDark ? 'bg-slate-800 border-white/[0.05]' : 'bg-white border-slate-200/80 shadow'} text-sky-500 font-extrabold border` : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}`}
                  >
                    <Briefcase className="w-4 h-4 text-sky-400" />
                    <span>Recruiter</span>
                  </button>
                </div>

                {/* Dynamic Sandbox Display in Pristine Dark Mode */}
                <div className={`max-w-4xl mx-auto rounded-3xl border ${isDark ? 'border-white/[0.08] bg-slate-900/40 shadow-[0_24px_50px_-15px_rgba(0,0,0,0.8)]' : 'border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]'} p-6 sm:p-10 relative overflow-hidden text-left`}>
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-45"></div>

                  <AnimatePresence mode="wait">
                    
                    {/* (A) STUDENT MOCK DASHBOARD */}
                    {roleTheme === "student" && (
                      <motion.div 
                        key="student-dashboard"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6 relative z-10"
                      >
                        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-205 border-slate-200'} gap-4`}>
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-500"> ALEXANDER SMITH • B.TECH CS </span>
                            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'} mt-1`}>Welcome Back, Alexander</h3>
                          </div>
                          <div className={`flex items-center space-x-2 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span>CGPA:</span>
                            <span className="text-emerald-500 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">9.12 / 10.0</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left: ATS Resume Matcher Widget */}
                          <div className={`${isDark ? 'bg-slate-900/60 border-white/[0.05]' : 'bg-slate-50 border-slate-200'} p-5 rounded-2xl border shadow-xs space-y-4 text-left`}>
                            <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
                              <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-705'} uppercase tracking-wider font-mono`}>AI Resume Match Evaluator</h4>
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            </div>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-semibold`}>
                              Simulate scanning a resume log. Our Gemini model weighs technical keywords directly against active employer listings.
                            </p>

                            <div className={`${isDark ? 'bg-slate-950 border-white/[0.1]' : 'bg-white border-slate-200'} border border-dashed rounded-xl p-5 text-center relative overflow-hidden`}>
                              <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                              <span className={`block text-xs font-bold font-mono ${isDark ? 'text-slate-300' : 'text-slate-750'}`}>resume_alexander_2026.pdf</span>
                              <span className="block text-[10px] text-slate-500 mt-1">Ready for real-time ATS scoring</span>

                              {atsScore > 0 && (
                                <div className={`mt-4 space-y-2 text-left ${isDark ? 'bg-slate-900 border-white/[0.05]' : 'bg-slate-50 border-slate-200'} p-3.5 rounded-xl border`}>
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>ATS Score Match Rate:</span>
                                    <span className="text-emerald-500 font-mono">{atsScore}% Match</span>
                                  </div>
                                  <div className={`w-full ${isDark ? 'bg-slate-950' : 'bg-slate-200'} h-2 rounded-full overflow-hidden`}>
                                    <div className="bg-emerald-500 h-full transition-all duration-3505" style={{ width: `${atsScore}%` }}></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button 
                              onClick={runFileScan}
                              disabled={isAnalyzing}
                              className="w-full btn-primary font-bold text-xs py-3 rounded-lg tracking-wider uppercase font-mono cursor-pointer"
                            >
                              {isAnalyzing ? "Gemini Parsing System..." : "Scan & Analyze Resume"}
                            </button>
                          </div>

                          {/* Right: Job Matching Recs list */}
                          <div className={`${isDark ? 'bg-slate-900/60 border-white/[0.05]' : 'bg-slate-50 border-slate-200'} p-5 rounded-2xl border shadow-xs space-y-4 text-left`}>
                            <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
                              <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-705'} uppercase tracking-wider font-mono`}>AI Job Matches</h4>
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-semibold`}>Verified roles suited for your branch CS, academic record and profile strength marks.</p>

                            <div className="space-y-2.5">
                              {[
                                { company: "Google Cloud", role: "SDE Intern (Security)", minCgpa: 8.5, atsReq: "90%", match: "94% Match" },
                                { company: "Razorpay", role: "Full Stack Engineer Intern", minCgpa: 8.0, atsReq: "85%", match: "88% Match" },
                                { company: "Adobe", role: "Product Developer Intern", minCgpa: 8.2, atsReq: "80%", match: "82% Match" }
                              ].map((job) => (
                                <div key={job.company} className={`p-3.5 rounded-xl ${isDark ? 'bg-slate-950 border-white/[0.03]' : 'bg-white border-slate-200/60 shadow-[0_2px_8px_rgba(15,23,42,0.02)]'} border flex items-center justify-between font-semibold`}>
                                  <div>
                                    <h5 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{job.company}</h5>
                                    <p className={`text-[10px] ${isDark ? 'text-slate-500 font-semibold' : 'text-slate-600 font-semibold'}`}>{job.role}</p>
                                    <div className={`flex space-x-2 mt-1 text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-mono`}>
                                      <span>CGPA ≥ {job.minCgpa}</span>
                                      <span>•</span>
                                      <span>ATS ≥ {job.atsReq}</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-550 px-2 py-1 rounded-lg border border-emerald-500/15">
                                    {job.match}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* (B) TPO MOCK DASHBOARD */}
                    {roleTheme === "tpo" && (
                      <motion.div 
                        key="tpo-dashboard"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6 relative z-10"
                      >
                        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'} gap-4`}>
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-500"> PLACEMENT CELL ADMIN CONTROL </span>
                            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-805'} mt-1`}>Institutional Rules Dashboard</h3>
                          </div>
                          <div className={`flex items-center space-x-2 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span>Auto Verification:</span>
                            <span className="text-purple-500 font-mono font-bold bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg">Rule Active</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Slider controller */}
                          <div className={`${isDark ? 'bg-slate-900/60 border-white/[0.05]' : 'bg-slate-50 border-slate-200'} p-5 rounded-2xl border shadow-xs space-y-4 text-left`}>
                            <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
                              <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider font-mono`}>Auto-Eligibility Filters</h4>
                              <Building2 className="w-4 h-4 text-purple-400" />
                            </div>

                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-semibold`}>
                              Drag to set the global CGPA barrier. Students below this value are auto-restricted from submitting applications to premiere recruiter drives.
                            </p>

                            <div className={`space-y-3 ${isDark ? 'bg-slate-950 border-white/[0.03]' : 'bg-white border-slate-200'} p-4.5 rounded-xl border`}>
                              <div className={`flex justify-between items-center text-xs font-bold ${isDark ? 'text-white' : 'text-slate-850'}`}>
                                <span>Minimum CGPA Required:</span>
                                <span className="text-purple-500 font-mono text-sm font-extrabold">{cgpaFilter.toFixed(1)} CGPA</span>
                              </div>
                              <input 
                                type="range" 
                                min="6.0" 
                                max="9.5" 
                                step="0.5"
                                value={cgpaFilter}
                                onChange={(e) => setCgpaFilter(parseFloat(e.target.value))}
                                className="w-full accent-purple-500 cursor-pointer"
                              />
                            </div>
                            <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-xl text-[10px] leading-relaxed font-semibold border border-purple-500/15">
                              🔒 <strong>Active Policy:</strong> Verified transcripts sync seamlessly via cloud backend. Zero room for student forge-tampering.
                            </div>
                          </div>

                          {/* Right Simulator results */}
                          <div className={`${isDark ? 'bg-slate-900/60 border-white/[0.05]' : 'bg-slate-50 border-slate-200'} p-5 rounded-2xl border shadow-xs space-y-4 text-left`}>
                            <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`}>
                              <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wider font-mono`}>Impact Audit Simulator</h4>
                              <span className="text-[10px] font-mono text-purple-500 font-bold">Live Stats</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className={`p-3 border rounded-xl ${isDark ? 'bg-slate-950 border-white/[0.02]' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'} uppercase font-bold tracking-wider block font-mono`}>Eligible CS Batch</span>
                                <span className={`text-xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-800'} mt-1 block`}>
                                  {cgpaFilter <= 7.0 ? "93%" : cgpaFilter <= 8.0 ? "78%" : cgpaFilter <= 9.0 ? "41%" : "12%"}
                                </span>
                              </div>
                              <div className={`p-3 border rounded-xl ${isDark ? 'bg-slate-950 border-white/[0.02]' : 'bg-white border-slate-200 shadow-sm'}`}>
                                <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-505'} uppercase font-bold tracking-wider block font-mono`}>Vetting Labor Hour cost</span>
                                <span className="text-xl font-bold font-mono text-emerald-500 mt-1 block">0 Hrs</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono block">Vetting Logs simulation:</span>
                              {[
                                { name: "Aditya Roy", cgpa: 8.8, status: "Eligible ✔", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" },
                                { name: "Ananya Deshmukh", cgpa: 7.9, status: cgpaFilter <= 7.9 ? "Eligible ✔" : "Restricted ✖", color: cgpaFilter <= 7.9 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" : "text-red-500 bg-red-500/10 border-red-500/10" }
                              ].map((log) => (
                                <div key={log.name} className={`flex justify-between items-center text-xs p-2.5 rounded-lg border ${isDark ? 'bg-slate-950 border-white/[0.02]' : 'bg-white border-slate-200'}`}>
                                  <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{log.name} <span className="text-[10px] text-slate-500">CNTR: CS</span></span>
                                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-md border ${log.color}`}>{log.status} (CGPA {log.cgpa})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* (C) RECRUITER MOCK DASHBOARD */}
                    {roleTheme === "company" && (
                      <motion.div 
                        key="recruiter-dashboard"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6 relative z-10"
                      >
                        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b ${isDark ? 'border-white/[0.08]' : 'border-slate-200'} gap-4`}>
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-500"> RAZORPAY • RECRUITER MODE </span>
                            <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-805'} mt-1`}>Hiring Candidate Funnel</h3>
                          </div>
                          <div className={`flex items-center space-x-2 text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            <span>Sourcing Metrics:</span>
                            <span className="text-sky-505 text-sky-500 font-mono font-bold bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-lg">Direct Sourced</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-semibold text-left`}>
                            Sourcing is fully automated. Click "Progress Status" on any card to simulate moving candidates through interview stages instantly.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            {["Vetted", "Interviewing", "Selected"].map((lane) => {
                              const candidatesInLane = pipelineCandidates.filter(c => c.status === lane);
                              return (
                                <div key={lane} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-950 border-white/[0.04]' : 'bg-slate-50 border-slate-200'}`}>
                                  <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-white/[0.03]' : 'border-slate-200'} mb-3`}>
                                    <span className={`text-[10px] uppercase tracking-wider font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-600'} font-mono`}>{lane} List</span>
                                    <span className="text-[10px] font-mono bg-sky-500/10 text-sky-505 text-sky-500 px-2 py-0.5 rounded-full font-bold">{candidatesInLane.length}</span>
                                  </div>

                                  <div className="space-y-2">
                                    {candidatesInLane.map((cand) => (
                                      <div key={cand.id} className={`p-3 ${isDark ? 'bg-slate-900 border-white/[0.04]' : 'bg-white border-slate-200 shadow-sm'} rounded-xl border group hover:border-sky-505 hover:border-sky-500 transition text-left`}>
                                        <div className="flex items-center justify-between gap-1">
                                          <h5 className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{cand.name}</h5>
                                          <button 
                                            onClick={() => progressCandidate(cand.id)}
                                            className="text-[9px] font-extrabold text-sky-550 text-sky-500 hover:text-sky-600 hover:bg-sky-550 hover:bg-sky-500/10 px-1.5 py-1 rounded transition bg-sky-500/5 font-mono cursor-pointer flex items-center gap-1 uppercase shrink-0"
                                          >
                                            <span>Progress Status</span>
                                            <ChevronRight className="w-3 h-3 text-sky-550 text-sky-500" />
                                          </button>
                                        </div>
                                        <div className={`flex items-center justify-between text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-500'} mt-2 font-semibold`}>
                                          <span>CGPA: <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} font-mono font-bold`}>{cand.cgpa}</span></span>
                                          <span className="text-sky-500 font-mono">ATS Match: {cand.ats}%</span>
                                        </div>
                                      </div>
                                    ))}

                                    {candidatesInLane.length === 0 && (
                                      <div className="text-center py-8 text-[10px] text-slate-500 font-semibold font-mono">
                                        Empty. Move cards here.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>

            {/* 4. THE COMPLETE PLACEMENT JOURNEY TIMELINE */}
            <section className={`py-24 bg-transparent px-6 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'} relative overflow-hidden`} id="how-it-works">
              <div className="max-w-7xl mx-auto text-center relative z-10 space-y-16">
                <div className="max-w-2xl mx-auto space-y-4">
                  <span className="text-[10px] font-extrabold text-[#a855f7] uppercase tracking-widest bg-purple-900/20 py-1.5 px-3.5 rounded-full inline-block border border-purple-500/20 font-mono">
                    WORKFLOW
                  </span>
                  <h2 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-805'} tracking-tight`}>The complete placement <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">journey</span>.</h2>
                  <p className={`text-xs sm:text-sm font-semibold max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    A simplified, fully-connected process matching premium opportunities in five logical milestones.
                  </p>
                </div>

                {/* Horizontal Connected Workflow Timeline */}
                <div className="relative max-w-5xl mx-auto">
                  {/* Glowing Connection Line */}
                  <div className={`absolute top-[45px] left-[5%] right-[5%] h-[1.5px] ${isDark ? 'bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-pink-500/30' : 'bg-gradient-to-r from-cyan-500/10 via-indigo-500/15 to-pink-500/10'} hidden lg:block pointer-events-none`} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                      { num: "1", title: "Onboard", desc: "Students upload digital resumes, TPOs setup profiles, and system maps credentials.", icon: <UserCheck className="w-5 h-5 text-cyan-400" /> },
                      { num: "2", title: "Analyze", desc: "AI parses qualifications, scans resume contents, and computes matching scores.", icon: <Brain className="w-5 h-5 text-indigo-400" /> },
                      { num: "3", title: "Match", desc: "Eligible profiles are instantly surfaced to training officers based on active criteria.", icon: <Target className="w-5 h-5 text-purple-400" /> },
                      { num: "4", title: "Interview", desc: "Multi-round interviews are locked in instantly with recruiters and panel diaries.", icon: <Calendar className="w-5 h-5 text-pink-400" /> },
                      { num: "5", title: "Place", desc: "Candidates secure verified job offers with live metrics tracking placement velocity.", icon: <Award className="w-5 h-5 text-emerald-400" /> }
                    ].map((step) => (
                      <div key={step.num} className={`p-5 rounded-2xl text-left flex flex-col justify-between space-y-4 transition-all relative group border ${isDark ? 'bg-[#090b14] border-white/[0.04]' : 'bg-slate-50 border-slate-200 hover:shadow-xs'}`}>
                        <div className="flex justify-between items-center relative">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${isDark ? 'bg-slate-900 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            {step.icon}
                          </div>
                          <span className={`text-lg font-mono font-black ${isDark ? 'text-slate-700 group-hover:text-white' : 'text-slate-300 group-hover:text-slate-700'} transition`}>0{step.num}</span>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className={`font-extrabold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-805'}`}>{step.title}</h4>
                          <p className={`text-[11px] font-semibold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 6. BACKLIT INSTITUTION COUNTERS BANNER CONTAINER */}
            <section className="py-16 bg-transparent px-6 relative" id="timeline">
              <div className="max-w-5xl mx-auto relative">
                {/* Backlit glow reflection trail */}
                <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-[2rem] pointer-events-none" />
                
                <div className={`relative rounded-3xl border py-12 px-8 flex flex-col md:flex-row justify-around items-center gap-8 shadow-2xl ${isDark ? 'bg-[#080a11]/90 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-center">
                    <span className="block text-4.5xl font-black font-sans tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">77%</span>
                    <span className="block text-[9px] font-extrabold tracking-widest text-slate-500 uppercase font-mono mt-1">Avg Placement Rate</span>
                  </div>
                  <div className={`h-12 w-[1px] hidden md:block ${isDark ? 'bg-white/[0.05]' : 'bg-slate-200'}`} />
                  <div className="text-center">
                    <span className="block text-4.5xl font-black font-sans tracking-tight bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">2x</span>
                    <span className="block text-[9px] font-extrabold tracking-widest text-slate-500 uppercase font-mono mt-1">Faster Drives</span>
                  </div>
                  <div className={`h-12 w-[1px] hidden md:block ${isDark ? 'bg-white/[0.05]' : 'bg-slate-200'}`} />
                  <div className="text-center">
                    <span className="block text-4.5xl font-black font-sans tracking-tight bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">165+</span>
                    <span className="block text-[9px] font-extrabold tracking-widest text-slate-500 uppercase font-mono mt-1">Partner Institutions</span>
                  </div>
                  <div className={`h-12 w-[1px] hidden md:block ${isDark ? 'bg-white/[0.05]' : 'bg-slate-200'}`} />
                  <div className="text-center">
                    <span className="block text-4.5xl font-black font-sans tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">14 LPA</span>
                    <span className="block text-[9px] font-extrabold tracking-widest text-slate-500 uppercase font-mono mt-1">Avg Package</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. TESTIMONIALS SECTION */}
            <section className={`py-24 bg-transparent px-4 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-200'}`} id="testimonials">
              <div className="max-w-3xl mx-auto text-center space-y-10">
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-[#a855f7] uppercase tracking-widest bg-purple-900/20 py-1.5 px-3.5 rounded-full inline-block border border-purple-500/20 font-mono">REVIEWS</span>
                  <h2 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-805'} tracking-tight`}>Vouched by All Three Portals</h2>
                </div>

                {/* Simulated Testimonial Carousel styled in clean modal glass style */}
                <div className={`rounded-3xl border p-8 sm:p-12 text-left relative overflow-hidden min-h-[280px] ${isDark ? 'bg-[#090b14] border-white/[0.06]' : 'bg-slate-50 border-slate-200/80 shadow'}`}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeTestimonial}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <span className={`inline-block py-1 px-3 rounded-full text-[10px] tracking-wider uppercase font-mono font-bold ${isDark ? 'bg-white/5 text-purple-400 border border-white/5' : 'bg-purple-100 text-purple-600 border border-purple-200'}`}>
                        {testimonials[activeTestimonial].role.toUpperCase()} LEVEL ENDORSEMENT
                      </span>

                      <blockquote className={`text-base sm:text-lg leading-relaxed font-semibold italic ${isDark ? 'text-slate-350 text-slate-300' : 'text-slate-700'}`}>
                        "{testimonials[activeTestimonial].quote}"
                      </blockquote>

                      <div className={`flex items-center space-x-4 pt-4 border-t ${isDark ? 'border-white/[0.04]' : 'border-slate-200'}`}>
                        <img 
                          referrerPolicy="no-referrer"
                          src={testimonials[activeTestimonial].avatar} 
                          alt={testimonials[activeTestimonial].name}
                          className={`w-12 h-12 rounded-full object-cover border shadow-sm ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}
                        />
                        <div>
                          <cite className={`block font-extrabold text-sm not-italic ${isDark ? 'text-white' : 'text-slate-805'}`}>{testimonials[activeTestimonial].name}</cite>
                          <span className={`block text-[11px] font-mono font-bold ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{testimonials[activeTestimonial].tag}</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Manual indices */}
                  <div className="flex justify-end space-x-2.5 mt-6 sm:mt-0">
                    {testimonials.map((_, i) => (
                      <button 
                        key={i}
                        onClick={() => setActiveTestimonial(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${activeTestimonial === i ? "bg-cyan-400 w-5" : "bg-slate-500 bg-opacity-40"}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 8. CTA SECTION */}
            <section className="py-24 bg-transparent px-4 text-center">
              <div className={`max-w-4xl mx-auto py-16 px-6 sm:px-16 rounded-[2.5rem] border shadow-2xl relative group overflow-hidden ${isDark ? 'bg-[#07090e] border-white/[0.06]' : 'bg-slate-50 border-slate-200/80'}`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover:scale-105 transition duration-500" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/15 bg-purple-500/5 px-4 py-1.5 text-[10px] font-mono tracking-widest uppercase font-bold text-purple-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span>Limited onboarding slots for 2026 batch</span>
                  </div>
                  <h2 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-805'}`}>Ready to transform<br />campus placements?</h2>
                  <p className={`text-xs sm:text-sm font-semibold max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Join 200+ institutions building the smartest, fully-automated placement ecosystem in the country.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                    <button 
                      onClick={() => { setAuthMode("register"); setActiveTab("auth"); setRole(roleTheme); setError(""); }}
                      className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 hover:brightness-110 active:scale-95 text-black font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10 cursor-pointer uppercase tracking-wider transition font-semibold"
                    >
                      <span>Join System Free</span>
                      <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
                    </button>
                    <button 
                      onClick={() => { setAuthMode("login"); setActiveTab("auth"); setRole(roleTheme); setError(""); }}
                      className={`w-full sm:w-auto rounded-full border font-extrabold px-8 py-3.5 text-xs sm:text-sm cursor-pointer uppercase tracking-wider transition ${isDark ? 'bg-slate-900 hover:bg-slate-800 border-white/[0.08] text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      Login Portal Hub
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* PREMIUM SPLIT SCREEN REGISTRATION & LOGIN PORTAL */
          <div className={`relative animate-fade-in flex flex-col justify-center min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden ${isDark ? 'bg-[#030408]' : 'bg-slate-50'}`} id="cc-split-auth">
            {/* Ambient Dynamic Glow Orbs */}
            <div className={`absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none opacity-20 ${role === 'student' ? 'bg-indigo-600/20' : 'bg-purple-600/20'}`} />
            <div className={`absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full blur-[120px] pointer-events-none opacity-20 bg-blue-600/10`} />

            {/* Split Screen Card Container with custom border highlights */}
            <div className={`relative z-10 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border ${isDark ? 'bg-[#07090e]/75 border-white/[0.08] shadow-[0_24px_50px_-15px_rgba(0,0,0,0.8)]' : 'bg-white border-slate-200 shadow-2xl'} backdrop-blur-xl`}>
              
              {/* LEFT ENTERPRISE ECOSYSTEM INFO PANEL */}
              <div className="hidden lg:flex lg:col-span-5 bg-[#030405] p-10 text-white flex-col justify-between relative overflow-hidden text-left border-r border-[#1e293b]/50">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>
                
                {/* Header branding */}
                <div className="relative z-10 flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("landing")}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mr-1 shadow-[0_4px_12px_rgba(168,85,247,0.3)]">
                    <GraduationCap className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-black tracking-tight text-white block">CampusConnect <span className="text-indigo-400 font-bold">AI</span></span>
                    <span className="text-[8px] font-extrabold tracking-wider text-slate-500 block uppercase">AI Campus Placement ecosystem</span>
                  </div>
                </div>

                {/* Live System Stats & Info */}
                <div className="relative z-10 my-auto py-8 space-y-6">
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight font-sans tracking-tight">
                    AI-Powered Campus Placement Ecosystem
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                    Connecting Students, Recruiters and Placement Officers through secure role-based workflows.
                  </p>

                  {/* 2x2 Bento Stats Card Grid */}
                  <div className="grid grid-cols-2 gap-3.5 pt-4">
                    <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-xl space-y-1 backdrop-blur-md hover:border-indigo-500/20 transition duration-300">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Registered Students</p>
                      <p className="text-xl font-black text-white">15,240+</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-xl space-y-1 backdrop-blur-md hover:border-indigo-500/20 transition duration-300">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Verified Recruiters</p>
                      <p className="text-xl font-black text-indigo-400">450+</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-xl space-y-1 backdrop-blur-md hover:border-indigo-500/20 transition duration-300">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Opportunities</p>
                      <p className="text-xl font-black text-blue-400">1,280+</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-xl space-y-1 backdrop-blur-md hover:border-indigo-500/20 transition duration-300">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Success Rate</p>
                      <p className="text-xl font-black text-emerald-400">94.6%</p>
                    </div>
                  </div>

                  {/* Security Badge row */}
                  <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
                    <p className="text-[9px] font-extrabold uppercase font-mono tracking-widest text-slate-500">Security & Architecture Badges</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-mono text-slate-300 font-bold hover:bg-white/[0.06] transition cursor-default">
                        <Lock className="w-3 h-3 text-indigo-400" /> Firebase Authentication
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-mono text-slate-300 font-bold hover:bg-white/[0.06] transition cursor-default">
                        <Database className="w-3 h-3 text-emerald-400" /> Firestore Secured
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-mono text-slate-300 font-bold hover:bg-white/[0.06] transition cursor-default">
                        <Shield className="w-3 h-3 text-purple-400" /> Role-Based Access Control
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-mono text-slate-300 font-bold hover:bg-white/[0.06] transition cursor-default">
                        <CheckCircle className="w-3 h-3 text-sky-400" /> Enterprise Grade Security
                      </span>
                    </div>
                  </div>
                </div>

                {/* Left Panel Footer */}
                <div className="relative z-10 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>© 2026 CampusConnect AI</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SSL Certified</span>
                  </span>
                </div>
              </div>

              {/* RIGHT FORM COLUMN (Upgraded with Interactive Multi-Step Stepper & Forms) */}
              <div className={`col-span-1 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center text-left ${isDark ? 'bg-[#05060b]' : 'bg-white'}`}>
                <div className="max-w-md w-full mx-auto space-y-6">

                  {/* STEPPER PROGRESS NAVIGATION HEADER */}
                  {authMode === "register" && (
                    <div className="mb-4">
                      {/* Stepper Steps Labels Row */}
                      <div className="flex justify-between items-center relative mb-4">
                        {/* Horizontal connecting line */}
                        <div className="absolute top-[18px] left-[5%] right-[5%] h-0.5 bg-slate-800 pointer-events-none z-0">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${((authStep - 1) / 4) * 100}%` }}
                          />
                        </div>

                        {/* Step circles */}
                        {[1, 2, 3, 4, 5].map((stepNum) => {
                          const isActive = authStep === stepNum;
                          const isCompleted = authStep > stepNum;
                          const label = ["Auth", "Role", "Profile", "Verify", "Done"][stepNum - 1];

                          return (
                            <div key={stepNum} className="flex flex-col items-center relative z-10 select-none">
                              <div 
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${isCompleted ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' : isActive ? 'bg-slate-900 border-2 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900/60 border border-slate-800 text-slate-500'}`}
                              >
                                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider font-mono mt-1.5 ${isActive ? 'text-indigo-400 font-extrabold' : isCompleted ? 'text-indigo-300 text-slate-305' : 'text-slate-500'}`}>{label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* FORM FEEDBACK NOTIFICATIONS */}
                  {error && (
                    error === "no-account-found" ? (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-4 rounded-2xl text-xs font-semibold leading-relaxed text-left">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 block shrink-0 animate-ping" />
                          <h4 className="font-extrabold text-red-400 text-sm tracking-tight">No account found for this email. Please register first.</h4>
                        </div>
                      </div>
                    ) : error === "google-only-account-login" ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-6 rounded-2xl text-xs font-semibold leading-relaxed space-y-4 text-left">
                        <div className="flex items-start gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 block shrink-0 animate-pulse" />
                          <div className="space-y-3">
                            <h4 className="font-extrabold text-amber-400 text-sm tracking-tight">This is account created with Google for know the password click on "Forgot password" button</h4>
                            <p className="text-slate-200 whitespace-pre-wrap font-medium">
                              This is account created with Google for know the password click on "Forgot password" button.
                            </p>
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black h-11 rounded-xl text-xs cursor-pointer transition shadow-md shadow-amber-500/15"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l2.42-2.42C17.435 1.5 14.945 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.73 0 10.2-4.03 10.2-10.2 0-.6-.05-1.17-.16-1.515H12.24Z" />
                            </svg>
                            <span>Continue with Google</span>
                          </button>
                        </div>
                      </div>
                    ) : error === "google-only-account-forgot" ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-6 rounded-2xl text-xs font-semibold leading-relaxed space-y-4 text-left">
                        <div className="flex items-start gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 block shrink-0 animate-pulse" />
                          <div className="space-y-2">
                            <h4 className="font-extrabold text-amber-400 text-sm tracking-tight">Google Authenticaton Required</h4>
                            <p className="text-slate-200 whitespace-pre-wrap font-medium">
                              This account uses Google Sign-In and does not have a password to reset. Please sign in using Continue with Google.
                            </p>
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black h-11 rounded-xl text-xs cursor-pointer transition shadow-md shadow-amber-500/15"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l2.42-2.42C17.435 1.5 14.945 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.73 0 10.2-4.03 10.2-10.2 0-.6-.05-1.17-.16-1.515H12.24Z" />
                            </svg>
                            <span>Continue with Google</span>
                          </button>
                        </div>
                      </div>
                    ) : error === "google-only-account" ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-6 rounded-2xl text-xs font-semibold leading-relaxed space-y-4 text-left">
                        <div className="flex items-start gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 block shrink-0 animate-pulse" />
                          <div className="space-y-2">
                            <h4 className="font-extrabold text-amber-400 text-sm tracking-tight">Google Sign-In Account Found</h4>
                            <p className="text-slate-200 leading-normal">
                              This account was created using Google Sign-In.
                            </p>
                            <p className="text-slate-300 leading-normal">
                              Since Google Sign-In accounts do not have a password by default, password login and password reset are currently unavailable.
                            </p>
                            <p className="text-slate-300 leading-normal">
                              Please click <span className="text-emerald-400 font-bold">"Continue with Google"</span> below and sign in using the same Google account you used during registration.
                            </p>
                            <p className="text-slate-300 leading-normal">
                              If you wish to use Email/Password login in the future, sign in with Google first and then link a password from your <span className="text-white font-bold">Account Settings</span>.
                            </p>
                            <p className="text-amber-300 font-bold mt-1.5 pt-1.5 border-t border-white/5 leading-normal">
                              Your account, profile, role, and data are safe and have not been lost. The same account is fully accessible securely.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 bg-amber-550 hover:bg-amber-500 text-slate-950 font-black h-11 rounded-xl text-xs cursor-pointer transition shadow-md shadow-amber-500/10"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l2.42-2.42C17.435 1.5 14.945 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.73 0 10.2-4.03 10.2-10.2 0-.6-.05-1.17-.16-1.515H12.24Z" />
                            </svg>
                            <span>Continue with Google</span>
                          </button>
                        </div>
                      </div>
                    ) : error.startsWith("unauthorized-domain") ? (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-5 rounded-2xl text-xs font-medium leading-relaxed space-y-4 text-left">
                        <div className="flex items-start gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 block shrink-0 animate-pulse" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-amber-400 text-sm">Firebase Domain Authorization Required</h4>
                            <p className="text-slate-300">
                              To use Google Sign-In with your custom Firebase project, you must authorize this application's domain in your Firebase Console.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                          <p className="font-semibold text-slate-200">📋 Copy these hostnames and add them under:</p>
                          <p className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 p-1.5 rounded border border-indigo-500/20 leading-none">
                            Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized Domains
                          </p>
                          
                          <div className="space-y-2">
                            {[
                              typeof window !== "undefined" ? window.location.hostname : "",
                              "localhost"
                            ].filter((h, i, arr) => h && arr.indexOf(h) === i).map((host) => (
                              <div key={host} className="flex justify-between items-center bg-slate-900/60 p-2 rounded border border-white/5 gap-2">
                                <span className="font-mono text-slate-300 select-all truncate">{host}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                                      navigator.clipboard.writeText(host);
                                    }
                                  }}
                                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded transition flex items-center gap-1 shrink-0"
                                >
                                  Copy
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-slate-400 text-[11px] leading-relaxed">
                          💡 <span className="font-semibold text-amber-400 font-sans text-xs">Instantly Bypass:</span> You can sign in or register instantly by entering any email & password below. Direct registrations bypass domain verification completely!
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5 text-left">
                        <span className="w-2 h-2 rounded-full bg-red-500 mt-1 block shrink-0" />
                        <p>{error.includes("|") ? error.split("|")[1] : error}</p>
                      </div>
                    )
                  )}

                  {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5 text-left">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 block shrink-0" />
                      <p>{success}</p>
                    </div>
                  )}

                  {/* WIZARD RENDERER logic */}

                  {/* CASE A: LOGIN MODE */}
                  {authMode === "login" && (
                    <form onSubmit={handleAuthSubmit} className="space-y-5 text-left">
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Welcome Back 👋</h2>
                          <button
                            type="button"
                            onClick={() => { setAuthMode("register"); setAuthStep(1); setError(""); setSuccess(""); }}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                          >
                            New registration?
                          </button>
                        </div>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Sign in to access your secure AI placement workspace
                        </p>
                      </div>

                      {/* Google Sign In button */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl text-xs border border-white/[0.08] cursor-pointer transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l2.42-2.42C17.435 1.5 14.945 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.73 0 10.2-4.03 10.2-10.2 0-.6-.05-1.17-.16-1.515H12.24Z" />
                        </svg>
                        <span>Continue with Google Account</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="h-px bg-slate-800 flex-1" />
                        <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">or login with email</span>
                        <div className="h-px bg-slate-800 flex-1" />
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Email Address</label>
                          <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@spsu.edu.in"
                            className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between items-center">
                            <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Password</label>
                            <button 
                              type="button"
                              onClick={() => { setAuthMode("forgot"); setError(""); setSuccess(""); }}
                              className="text-[10px] font-bold text-slate-400 hover:text-white"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full border p-3 pr-10 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 active:scale-[0.98] text-white font-black h-12 rounded-xl text-xs sm:text-sm uppercase tracking-widest font-mono cursor-pointer transition select-none shadow-md shadow-indigo-500/20"
                      >
                        {loading ? "Authenticating session..." : "Access Workspace Central"}
                      </button>
                    </form>
                  )}

                  {/* CASE B: REGISTER STEP 1 -> AUTHENTICATION FLOW */}
                  {authMode === "register" && authStep === 1 && (
                    <form onSubmit={handleAuthSubmit} className="space-y-5 text-left">
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Account</h2>
                          <button
                            type="button"
                            onClick={() => { setAuthMode("login"); setError(""); setSuccess(""); }}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                          >
                            Sign in instead?
                          </button>
                        </div>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Step 1: Setup secure login credentials for placement system access
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 bg-[#0a0b10] hover:bg-[#151821] text-white font-bold h-12 rounded-xl text-xs border border-white/[0.08] cursor-pointer transition"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.6 1.7l2.42-2.42C17.435 1.5 14.945 1 12.24 1c-5.52 0-10 4.48-10 10s4.48 10 10 10c5.73 0 10.2-4.03 10.2-10.2 0-.6-.05-1.17-.16-1.515H12.24Z" />
                        </svg>
                        <span>Onboard using Google Workspace</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <div className="h-px bg-slate-800 flex-1" />
                        <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-widest">or register using password</span>
                        <div className="h-px bg-slate-800 flex-1" />
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Email Address</label>
                          <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@spsu.edu.in"
                            className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                          />
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full border p-3 pr-10 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Confirm Password</label>
                          <div className="relative">
                            <input 
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full border p-3 pr-10 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 active:scale-[0.98] text-white font-black h-12 rounded-xl text-xs sm:text-sm uppercase tracking-widest font-mono cursor-pointer transition select-none shadow-md shadow-indigo-500/20"
                      >
                        {loading ? "Creating credentials..." : "Register & Select Role →"}
                      </button>
                    </form>
                  )}

                  {/* CASE C: REGISTER STEP 2 -> ROLE SELECTION (STUDENT & RECRUITER ONLY) */}
                  {authMode === "register" && authStep === 2 && (
                    <div className="space-y-6 animate-fade-in text-left">
                      <div className="space-y-1 text-center">
                        <h2 className={`text-2xl font-black tracking-tight text-white`}>Select Workspace Role</h2>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Step 2: Assign your authenticated credential context a role
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Student Role option */}
                        <div 
                          onClick={() => setRole("student")}
                          className={`border p-5 rounded-2xl cursor-pointer transition text-center flex flex-col items-center justify-center space-y-3 ${role === "student" ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_4px_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.06]'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === "student" ? 'bg-indigo-550 bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-white">Student Candidate</p>
                            <p className="text-[10px] text-slate-400 leading-normal mt-1">Submit enrollment profile to explore AI job placement drives immediately</p>
                          </div>
                        </div>

                        {/* Recruiter Role option */}
                        <div 
                          onClick={() => setRole("company")}
                          className={`border p-5 rounded-2xl cursor-pointer transition text-center flex flex-col items-center justify-center space-y-3 ${role === "company" ? 'bg-purple-500/10 border-purple-500 shadow-[0_4px_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500' : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.06]'}`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${role === "company" ? 'bg-purple-550 bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-white">Enterprise Recruiter</p>
                            <p className="text-[10px] text-slate-400 leading-normal mt-1">Publish job descriptions, manage applications, and coordinate candidate verification</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setAuthStep(1)}
                          className="w-1/3 py-3 border border-slate-800 font-bold max-w-sm rounded-xl text-xs hover:bg-white/5 text-slate-400 uppercase tracking-widest font-mono transition"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthStep(3)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:brightness-110 text-white font-black py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wide font-mono transition shadow-lg shadow-indigo-500/10"
                        >
                          Onboard Profile Details →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CASE D: REGISTER STEP 3 -> PROFILE FORM BASED ON ASSIGNED ROLE */}
                  {authMode === "register" && authStep === 3 && (
                    <form onSubmit={handleOnboardingSubmit} className="space-y-4 animate-fade-in text-left">
                      <div className="space-y-1 text-center">
                        <h2 className={`text-2xl font-black tracking-tight text-white`}>
                          {role === "student" ? "Student Candidate Details" : "Enterprise Recruiter Details"}
                        </h2>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Step 3: Provide required verification parameters to assign role credentials
                        </p>
                      </div>

                      {/* General fields */}
                      <div className="space-y-1.5 text-left">
                        <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Full Contact Name</label>
                        <input 
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Legal Name"
                          className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                        />
                      </div>

                      {/* STUDENT FORM FIELDS */}
                      {role === "student" && (
                        <div className="space-y-3.5 text-left">
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>SPSU Academic Email</label>
                              <input 
                                type="email"
                                disabled
                                value={tempEmail}
                                className="w-full border p-3 text-xs rounded-xl font-mono text-slate-500 bg-[#0e1017] border-white/[0.05] outline-none"
                              />
                            </div>
                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Enrollment Number</label>
                              <input 
                                type="text"
                                required
                                value={enrollmentNumber}
                                onChange={(e) => setEnrollmentNumber(e.target.value)}
                                placeholder="e.g. SPSU/2023/CS/045"
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>College Branch</label>
                              <select 
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              >
                                <option value="Computer Science">Comp Science</option>
                                <option value="Information Technology">Information Tech</option>
                                <option value="ECE">ECE Telecom</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Civil">Civil</option>
                              </select>
                            </div>

                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Course / Degree</label>
                              <select 
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              >
                                <option value="B.Tech">B.Tech</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="MCA">MCA</option>
                                <option value="MBA">MBA</option>
                              </select>
                            </div>

                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Passout Year</label>
                              <select 
                                value={graduationYear}
                                onChange={(e) => setGraduationYear(e.target.value)}
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              >
                                <option value="2025">2025 Batch</option>
                                <option value="2026">2026 Batch</option>
                                <option value="2027">2027 Batch</option>
                                <option value="2028">2028 Batch</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RECRUITER FORM FIELDS */}
                      {role === "company" && (
                        <div className="space-y-3.5 text-left">
                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Company Name</label>
                              <input 
                                type="text"
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Google / Stripe"
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              />
                            </div>
                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Company Business Email</label>
                              <input 
                                type="email"
                                required
                                value={companyEmail || tempEmail}
                                onChange={(e) => setCompanyEmail(e.target.value)}
                                placeholder="recruitment@stripe.com"
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Website URL</label>
                              <input 
                                type="text"
                                required
                                value={companyWebsite}
                                onChange={(e) => setCompanyWebsite(e.target.value)}
                                placeholder="https://stripe.com"
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              />
                            </div>
                            <div className="space-y-1.5 text-left">
                              <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Phone Number</label>
                              <input 
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 99999-99999"
                                className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>LinkedIn Profile (Optional)</label>
                            <input 
                              type="text"
                              value={companyLinkedin}
                              onChange={(e) => setCompanyLinkedin(e.target.value)}
                              placeholder="https://linkedin.com/company/stripe"
                              className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                            />
                          </div>

                          <div className="space-y-1.5 text-left">
                            <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Company Workspace Bio</label>
                            <textarea 
                              value={companyDescription}
                              onChange={(e) => setCompanyDescription(e.target.value)}
                              placeholder="Brief summary about your hiring pipeline or teams..."
                              className={`w-full border p-3 text-xs h-16 resize-none rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3.5 pt-2 text-left">
                        <button
                          type="button"
                          onClick={() => setAuthStep(2)}
                          className="w-1/3 py-3 border border-slate-800 font-bold max-w-sm rounded-xl text-xs hover:bg-white/5 text-slate-400 uppercase tracking-widest font-mono transition"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:brightness-110 text-white font-black py-3 rounded-xl text-xs sm:text-sm uppercase tracking-wider font-mono transition shadow-lg shadow-indigo-600/15"
                        >
                          {loading ? "Activating Profile..." : "Finalize & Launch Workspace →"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* CASE E: REGISTER STEP 4 -> INTERACTIVE FORGOT PASSWORD FORM */}
                  {authMode === "forgot" && (
                    <form onSubmit={handleAuthSubmit} className="space-y-5 animate-fade-in text-left">
                      <div className="space-y-1">
                        <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Recover Account</h2>
                        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          Provide your registered email address and we will dispatch a reset link.
                        </p>
                      </div>

                      <div className="space-y-4 text-left">
                        <div className="space-y-1.5 text-left">
                          <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Email Address</label>
                          <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@spsu.edu.in"
                            className={`w-full border p-3 text-xs rounded-xl font-semibold outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 active:scale-[0.98] text-white font-black h-12 rounded-xl text-xs sm:text-sm uppercase tracking-widest font-mono cursor-pointer transition select-none shadow-md shadow-indigo-500/20"
                      >
                        {loading ? "Sending link..." : "Send Password Reset Link"}
                      </button>

                      <div className="text-center pt-2">
                        <button 
                          type="button" 
                          onClick={() => { setAuthMode("login"); setError(""); setSuccess(""); }}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                        >
                          Return to sign-in panel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* CASE F: TPO SECURE ACCESS CODE VERIFICATION FORM */}
                  {authMode === "accessCode" && (
                    <form onSubmit={handleAccessCodeSubmit} className="space-y-5 animate-fade-in text-left">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="p-1 px-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 font-mono text-[9px] uppercase font-bold tracking-wider">TPO Security Gate</span>
                        </div>
                        <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>Security Access Code</h2>
                        <p className={`text-xs font-semibold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          This portal is strictly reserved for authenticated TPOs. Enter your 6-digit administrative access code to authorize this session.
                        </p>
                      </div>

                      <div className="space-y-4 text-left">
                        <div className="space-y-1.5 text-left font-semibold">
                          <label className={`block text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wider font-mono`}>Enter 6-Digit Access Code</label>
                          <input 
                            type="password"
                            required
                            maxLength={6}
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="••••••"
                            className={`w-full tracking-[1em] text-center border p-4 text-xl rounded-xl font-black font-mono outline-none transition-colors ${isDark ? 'bg-[#11131c] border-white/[0.08] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-500'}`}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:brightness-110 active:scale-[0.98] text-white font-black h-12 rounded-xl text-xs sm:text-sm uppercase tracking-widest font-mono cursor-pointer transition select-none shadow-md shadow-indigo-500/20"
                      >
                        {loading ? "Verifying clearance level..." : "Verify Clearance & Open Dashboard"}
                      </button>

                      <div className="text-center pt-2">
                        <button 
                          type="button" 
                          onClick={() => { 
                            setAuthMode("login"); 
                            setError(""); 
                            setSuccess(""); 
                            setAccessCode(""); 
                            if (onCancelVerification) onCancelVerification();
                          }}
                          className={`text-xs font-bold transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          Cancel & Return to login
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="text-center pt-3 border-t border-white/[0.04]">
                    <button 
                      type="button" 
                      onClick={() => { setActiveTab("landing"); setError(""); setSuccess(""); }}
                      className={`text-xs font-bold transition cursor-pointer ${isDark ? 'text-slate-500 hover:text-slate-350' : 'text-slate-600 hover:text-slate-800'}`}
                    >
                      ← Return to information homepage
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={`py-16 border-t mt-auto text-left ${isDark ? 'bg-slate-955 bg-slate-950 text-slate-400 border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`} id="cc-main-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          <div className="md:col-span-6 space-y-4">
            <div className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-805'}`}>
              <GraduationCap className="w-6 h-6 text-blue-400" />
              <span className="font-extrabold text-lg tracking-tight">CampusConnect AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-semibold">
              AI-powered placement governance platform linking engineering candidates, academic administration cells, and global recruitment managers.
            </p>
            <div className="flex space-x-3 pt-2 text-[10px] font-mono font-black">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">🟢 Student portal online</span>
              <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded">🟣 TPO validation online</span>
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded">🔵 Recruiter desk live</span>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-wrap gap-8 md:justify-end text-xs font-mono font-bold tracking-wider">
            <div>
              <h5 className={`text-xs font-black uppercase mb-3 tracking-widest ${isDark ? 'text-white' : 'text-slate-805'}`}>Navigation</h5>
              <div className="flex flex-col space-y-2">
                <a href="#features" onClick={() => setActiveTab("landing")} className="hover:text-blue-400 transition">Features</a>
                <a href="#demo" onClick={() => setActiveTab("landing")} className="hover:text-blue-400 transition">Interactive Demo</a>
                <a href="#timeline" onClick={() => setActiveTab("landing")} className="hover:text-blue-400 transition">Operations Timeline</a>
              </div>
            </div>
            <div>
              <h5 className={`text-xs font-black uppercase mb-3 tracking-widest ${isDark ? 'text-white' : 'text-slate-805'}`}>Institutional</h5>
              <div className="flex flex-col space-y-2">
                <span className="cursor-not-allowed text-slate-600">Academic Vetting T&C</span>
                <span className="cursor-not-allowed text-slate-600">Privacy & Audits</span>
                <span className="cursor-not-allowed text-slate-600">Google Workspace Config</span>
              </div>
            </div>
          </div>

        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono ${isDark ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-500'}`}>
          <p>© 2026 CampusConnect AI. Direct placement metrics platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 text-[10px] font-extrabold uppercase tracking-widest text-[#2563eb]">SECURE UNIVERSITY AUTHENTICATION HUB</p>
        </div>
      </footer>
    </div>
  );
}
