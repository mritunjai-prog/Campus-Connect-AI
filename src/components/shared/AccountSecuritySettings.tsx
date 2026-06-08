import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Key, 
  ShieldCheck, 
  Link, 
  Eye, 
  EyeOff, 
  User, 
  FileLock2 
} from "lucide-react";
import { auth, googleProvider } from "../../lib/firebase";
import { 
  EmailAuthProvider, 
  linkWithCredential, 
  updatePassword, 
  GoogleAuthProvider,
  User as FirebaseUser,
  linkWithPopup
} from "firebase/auth";

interface AccountSecuritySettingsProps {
  theme: "light" | "dark";
  userRole?: string;
  userEmail?: string;
}

export default function AccountSecuritySettings({ theme, userRole, userEmail }: AccountSecuritySettingsProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Sync current user and providers
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      setProviders(user.providerData.map(p => p.providerId));
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setProviders(user.providerData.map(p => p.providerId));
      } else {
        setCurrentUser(null);
        setProviders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const hasPasswordProvider = providers.includes("password");
  const hasGoogleProvider = providers.includes("google.com");

  const refreshProviders = () => {
    const user = auth.currentUser;
    if (user) {
      user.reload().then(() => {
        setCurrentUser(auth.currentUser);
        setProviders(auth.currentUser?.providerData.map(p => p.providerId) || []);
      });
    }
  };

  const handleLinkEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentUser || !currentUser.email) {
      setErrorMsg("No active authenticated user session found.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await linkWithCredential(currentUser, credential);
      setSuccessMsg("Success! Password credential linked. You can now login with either Google or Email/Password.");
      setPassword("");
      setConfirmPassword("");
      refreshProviders();
    } catch (err: any) {
      console.error("[AccountSettings] Error linking email/password:", err);
      if (err.code === "auth/provider-already-linked") {
        setErrorMsg("This login provider is already linked to your account.");
      } else if (err.code === "auth/credential-already-in-use") {
        setErrorMsg("The email credentials are already associated with another account in Firebase. Contact placement admin.");
      } else {
        setErrorMsg(err.message || "Failed to set password and link credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentUser) {
      setErrorMsg("No active authenticated user session found.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(currentUser, password);
      setSuccessMsg("Your login password has been changed successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("[AccountSettings] Error changing password:", err);
      if (err.code === "auth/requires-recent-login") {
        setErrorMsg("Security action requires a recent login. Please log out and log back in to verify identity before setting a new password.");
      } else {
        setErrorMsg(err.message || "Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentUser) {
      setErrorMsg("No active authenticated user session found.");
      return;
    }

    setLoading(true);
    try {
      await linkWithPopup(currentUser, googleProvider);
      setSuccessMsg("Google account linked successfully! You can now log in using Continue with Google.");
      refreshProviders();
    } catch (err: any) {
      console.error("[AccountSettings] Error linking Google provider:", err);
      if (err.code === "auth/provider-already-linked") {
        setErrorMsg("Google login is already linked to this profile.");
      } else if (err.code === "auth/credential-already-in-use") {
        setErrorMsg("This Google profile is already associated with another existing account on CampusConnect.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setErrorMsg("Google authentication popup closed without completing link.");
      } else {
        setErrorMsg(err.message || "Failed to link Google Sign-In.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!window.confirm("Are you absolutely sure you want to permanently delete your account? This will erase all your profile data and cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const jwtToken = localStorage.getItem("campus_connect_jwt");
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${jwtToken}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger user data purge on the server.");
      }

      // Try deleting user locally
      if (currentUser) {
        try {
          await currentUser.delete();
        } catch (e) {
          console.warn("Client side deleteUser skipped. Server deleted successfully.", e);
        }
      }

      setSuccessMsg("Your account and all associated data have been permanently deleted. Logging out...");
      
      localStorage.removeItem("campus_connect_jwt");
      localStorage.removeItem("campus_connect_user");
      
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (err: any) {
      console.error("[AccountSettings] Error deleting account:", err);
      setErrorMsg(err.message || "Failed to delete account. Please re-authenticate and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
          <FileLock2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Account & Security</h2>
          <span className="text-xs text-slate-450 dark:text-slate-500">Enable multiple login methods and update security preferences</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-205 dark:border-rose-900/50 rounded-2xl flex items-start space-x-3 text-rose-800 dark:text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-205 dark:border-emerald-900/50 rounded-2xl flex items-start space-x-3 text-emerald-800 dark:text-emerald-300">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs font-semibold leading-relaxed">{successMsg}</div>
        </div>
      )}

      {/* Account Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile details */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Active Credentials Profile</span>
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5 text-xs text-slate-650 dark:text-slate-350">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-white">{currentUser?.displayName || "Campus User"}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-slate-650 dark:text-slate-350">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{currentUser?.email || userEmail || "Not specified"}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs">
              <span className="text-slate-400 font-medium">Role Clearance:</span>
              <span className="bg-indigo-50 dark:bg-indigo-950/35 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                {userRole || "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic linked status */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Authorized Login Methods</span>
          <div className="space-y-2.5">
            {/* Google provider status */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.03-1.19-.24-1.72-.54c.26-.03.53-.09.53-.09z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-semibold text-slate-800 dark:text-white">Google Sign-In</span>
              </div>
              {hasGoogleProvider ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 uppercase bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-md">
                  <CheckCircle className="w-3 h-3 text-emerald-500 stroke-[3]" />
                  <span>Linked</span>
                </span>
              ) : (
                <button
                  onClick={handleLinkGoogle}
                  disabled={loading}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-md transition border border-slate-200 dark:border-slate-700"
                >
                  Link Account
                </button>
              )}
            </div>

            {/* Email/password status */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-805 dark:text-white">Email & Password Login</span>
              </div>
              {hasPasswordProvider ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 uppercase bg-emerald-50 dark:bg-emerald-950/25 px-2 py-0.5 rounded-md">
                  <CheckCircle className="w-3 h-3 text-emerald-500 stroke-[3]" />
                  <span>Linked</span>
                </span>
              ) : (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center space-x-1 uppercase bg-amber-50 dark:bg-amber-950/25 px-2 py-0.5 rounded-md">
                  <span>Inactive</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Set / Link password card */}
      <div className="p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-850 pb-3">
          <Key className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {hasPasswordProvider ? "Change Login Password" : "Set Account Password & Link Login Provider"}
          </h3>
        </div>

        {!hasPasswordProvider && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You registered and logged in with your Google Account. By setting a password below, we will securely link an <b>email and password authentication credential</b> to this email. Doing this allows you to subsequently log in via <b>Google Sign-In OR by typing your Email and Password</b> seamlessly under the exact same identity!
          </p>
        )}

        <form onSubmit={hasPasswordProvider ? handleChangePassword : handleLinkEmailPassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">
                {hasPasswordProvider ? "New Account Password" : "Set Safe Password (min. 6 characters)"}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs p-3.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wide">
                Confirm Selected Password
              </label>
              <input 
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-50 dark:border-slate-850">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center space-x-2 shrink-0 cursor-pointer disabled:bg-slate-500"
            >
              {loading ? (
                <>Setting credentials...</>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{hasPasswordProvider ? "Apply New Password" : "Set Password & Link Login"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-[2rem] border border-rose-200 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/5 space-y-4">
        <div className="flex items-center space-x-2 border-b border-rose-100 dark:border-rose-900/10 pb-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h3 className="font-bold text-sm text-rose-900 dark:text-rose-200">
            Danger Zone
          </h3>
        </div>
        <p className="text-xs text-rose-700 dark:text-rose-350 leading-relaxed">
          Permanently delete your account and retrieve all your data from our servers. All information stored inside the profiles, applications, scheduled interviews, and authorization tables will be immediately purged across all collections.
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center space-x-2 shrink-0 cursor-pointer disabled:bg-slate-500"
          >
            {loading ? "Deleting account data..." : "Permanently Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
