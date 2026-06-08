import React, { useState, useEffect, Suspense, lazy } from "react";
import LandingPage from "./components/LandingPage";
const StudentPortal = lazy(() => import("./components/StudentPortal"));
const TpoPortal = lazy(() => import("./components/TpoPortal"));
const CompanyPortal = lazy(() => import("./components/CompanyPortal"));
import VerificationPendingPage from "./components/VerificationPending";
import AccountRejectedPage from "./components/AccountRejected";
import TpoEmailVerification from "./components/TpoEmailVerification";
import { Theme } from "./types";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AnimatePresence, motion } from "motion/react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("campus_connect_jwt"));
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>((localStorage.getItem("campus_theme") as Theme) || "dark");

  const [tpoNeedsVerification, setTpoNeedsVerification] = useState<boolean>(false);
  const [tempTpoIdToken, setTempTpoIdToken] = useState<string>("");
  const [tempTpoEmail, setTempTpoEmail] = useState<string>("");

  const location = useLocation();
  const navigate = useNavigate();

  const userRef = React.useRef(user);
  const profileRef = React.useRef(profile);
  userRef.current = user;
  profileRef.current = profile;

  // Dynamic API base matching hosting context dynamically
  const apiBaseUrl = ""; // Resolves relative to current host route natively

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[Auth] onAuthStateChanged:", firebaseUser?.email);
      if (firebaseUser) {
        // If we already have user state active and matching, skip duplicate calls
        const localUserStr = localStorage.getItem("campus_connect_user");
        const localToken = localStorage.getItem("campus_connect_jwt");
        if (localUserStr && localToken) {
          try {
            const cachedUser = JSON.parse(localUserStr);
            if (cachedUser && cachedUser.email === firebaseUser.email && userRef.current && profileRef.current) {
              setLoading(false);
              return;
            }
          } catch (e) {}
        }

        try {
          const cachedUserStr = localStorage.getItem("campus_connect_user");
          const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
          const role = cachedUser?.role || "student";

          const idToken = await firebaseUser.getIdToken();
          const activeJwt = localStorage.getItem("campus_connect_jwt");
          const res = await fetch(`${apiBaseUrl}/api/auth/login-firebase`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              ...(activeJwt ? { "Authorization": `Bearer ${activeJwt}` } : {})
            },
            body: JSON.stringify({ idToken, role })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.accessCodeRequired) {
              setTempTpoIdToken(idToken);
              setTempTpoEmail(data.email || firebaseUser.email || "");
              setTpoNeedsVerification(true);
              setToken(null);
              setUser(null);
              setProfile(null);
            } else if (data.token) {
              handleLoginSuccess(data.token, data.user, data.profile);
              setTpoNeedsVerification(false);
            } else {
              console.warn("[Auth] Firebase token login failed: missing token.");
              handleLogout();
            }
          } else {
            console.warn("[Auth] Firebase token login failed during state sync.");
            handleLogout();
          }
        } catch (err) {
          console.error("[Auth] Error sync with Firebase user:", err);
          handleLogout();
        } finally {
          setLoading(false);
        }
      } else {
        // No firebase user is present. If we have a stored local token, validate it rather than clearing it.
        const storedToken = localStorage.getItem("campus_connect_jwt");
        if (storedToken) {
          validateAndLoadProfile(storedToken);
        } else {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("campus_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const validateAndLoadProfile = async (explicitToken?: string) => {
    const activeToken = explicitToken || token || localStorage.getItem("campus_connect_jwt");
    if (!activeToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/profile`, {
        headers: { "Authorization": `Bearer ${activeToken}` }
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textFallback = await res.text();
        console.warn("Expected JSON but got HTML/text:", textFallback.substring(0, 500));
        throw new Error(`Profile sync error: server returned ${res.status}`);
      }
      
      const data = await res.json();
      
      if (res.ok) {
        // Build user from decrypted claims and server-sent single source of truth
        setProfile(data.profile);
        
        const resolvedUser = data.user || {
          id: data.profile.userId || data.profile.id,
          email: data.profile.email,
          role: data.role || (data.profile.branch ? "student" : (data.profile.department ? "tpo" : (data.profile.role || "recruiter"))),
          name: data.profile.name
        };
        
        setUser(resolvedUser);
        localStorage.setItem("campus_connect_user", JSON.stringify(resolvedUser));
      } else {
        // Token expired or server restarted
        handleLogout();
      }
    } catch (err) {
      console.error("Fail security profiles validation sync:", err);
      // Fail gracefully preserving cached logins for temporary offline preview
      const cachedUser = localStorage.getItem("campus_connect_user");
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      } else {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (loginToken: string, loggedUser: any, userProfile: any) => {
    localStorage.setItem("campus_connect_jwt", loginToken);
    localStorage.setItem("campus_connect_user", JSON.stringify(loggedUser));
    setToken(loginToken);
    setUser(loggedUser);
    setProfile(userProfile);
    // Immediately navigate to the correct role portal
    const role = loggedUser?.role;
    if (role === 'student') navigate('/student', { replace: true });
    else if (role === 'tpo') navigate('/tpo', { replace: true });
    else if (role === 'recruiter' || role === 'company') navigate('/company', { replace: true });
  };

  const handleLogout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("./lib/firebase");
      await signOut(auth);
    } catch (err) {
      console.warn("Client firebase signout warning:", err);
    }
    localStorage.removeItem("campus_connect_jwt");
    localStorage.removeItem("campus_connect_user");
    setToken(null);
    setUser(null);
    setProfile(null);
    setTpoNeedsVerification(false);
    setTempTpoIdToken("");
    setTempTpoEmail("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center text-slate-800" id="app-loading-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {/* Spinning clean accent ring */}
            <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
            <div className="absolute inset-0 bg-blue-400/5 rounded-full blur-xl"></div>
          </div>
          <div className="text-center space-y-1">
            <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Initializing Systems</span>
            <span className="block text-sm font-extrabold tracking-tight text-slate-900">CampusConnect AI</span>
          </div>
        </div>
      </div>
    );
  }

  const SuspenseFallback = (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#030408] flex flex-col items-center justify-center text-slate-800 dark:text-slate-200">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
        </div>
        <div className="text-center space-y-1">
          <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Loading Portal</span>
        </div>
      </div>
    </div>
  );

  const renderLandingOrRedirect = () => {
    if (token && user) {
      const targetRole = user.role === 'recruiter' ? 'company' : user.role;
      return <Navigate to={`/${targetRole}`} replace />;
    }
    return (
      <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="w-full h-full">
        <LandingPage 
          onLoginSuccess={(tok, usr, prof) => {
            setTpoNeedsVerification(false);
            handleLoginSuccess(tok, usr, prof);
          }} 
          apiBaseUrl={apiBaseUrl} 
          theme={theme}
          toggleTheme={toggleTheme}
          initialAuthMode={tpoNeedsVerification ? "accessCode" : undefined}
          initialTempIdToken={tpoNeedsVerification ? tempTpoIdToken : undefined}
          initialTempEmail={tpoNeedsVerification ? tempTpoEmail : undefined}
          onCancelVerification={handleLogout}
        />
      </motion.div>
    );
  };

  const getRouteKey = (path: string) => {
    const segment = path.split('/')[1] || '';
    if (['', 'features', 'dashboards', 'how-it-works', 'about', 'contact'].includes(segment)) {
      return 'landing';
    }
    return segment;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={getRouteKey(location.pathname)}>
        <Route path="/" element={renderLandingOrRedirect()} />
        <Route path="/features" element={renderLandingOrRedirect()} />
        <Route path="/dashboards" element={renderLandingOrRedirect()} />
        <Route path="/how-it-works" element={renderLandingOrRedirect()} />
        <Route path="/about" element={renderLandingOrRedirect()} />
        <Route path="/contact" element={renderLandingOrRedirect()} />

        <Route path="/student/*" element={
          token && user?.role === "student" ? (
            <motion.div key="student" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full h-full">
              <Suspense fallback={SuspenseFallback}>
                <StudentPortal 
                  token={token} 
                  user={user} 
                  initialProfile={profile} 
                  apiBaseUrl={apiBaseUrl} 
                  onLogout={handleLogout} 
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              </Suspense>
            </motion.div>
          ) : <Navigate to="/" />
        } />

        <Route path="/tpo/*" element={
          token && user?.role === "tpo" ? (
            <motion.div key="tpo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full h-full">
              <Suspense fallback={SuspenseFallback}>
                <TpoPortal 
                  token={token} 
                  user={user} 
                  apiBaseUrl={apiBaseUrl} 
                  onLogout={handleLogout} 
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              </Suspense>
            </motion.div>
          ) : <Navigate to="/" />
        } />

        <Route path="/company/*" element={
          token && (user?.role === "company" || user?.role === "recruiter") ? (() => {
            const isPending = user.status === "pending_verification" || user.status === "request_more_info" || profile?.approvalStatus === "pending";
            const isRejected = user.status === "rejected" || profile?.approvalStatus === "rejected";

            if (isPending) {
              return (
                <motion.div key="pending" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full h-full">
                  <VerificationPendingPage onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} user={user} />
                </motion.div>
              );
            } else if (isRejected) {
              return (
                <motion.div key="rejected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full h-full">
                  <AccountRejectedPage onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
                </motion.div>
              );
            }
            return (
              <motion.div key="company" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="w-full h-full">
                <Suspense fallback={SuspenseFallback}>
                  <CompanyPortal 
                    token={token} 
                    user={user} 
                    initialProfile={profile} 
                    apiBaseUrl={apiBaseUrl} 
                    onLogout={handleLogout} 
                    theme={theme}
                    toggleTheme={toggleTheme}
                  />
                </Suspense>
              </motion.div>
            );
          })() : <Navigate to="/" />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}
