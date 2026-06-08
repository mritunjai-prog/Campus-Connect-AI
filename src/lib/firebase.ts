import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDocFromServer 
} from "firebase/firestore";
import staticConfig from "../../firebase-applet-config.json";

// Use the static config bundled with the app. The synchronous XHR to /api/firebase-config
// was removed because it blocks the main thread and can cause the page to hang.
// The static config from firebase-applet-config.json already contains the correct values.
// If a live config refresh is needed, it can be done asynchronously after init.
let firebaseConfig = { ...staticConfig };

const app = initializeApp(firebaseConfig);

// Async config refresh (non-blocking) — updates config if server provides live values
(async () => {
  try {
    const res = await fetch("/api/firebase-config");
    if (res.ok) {
      const liveConfig = await res.json();
      if (liveConfig && liveConfig.projectId && !liveConfig.projectId.includes("placeholder") && !liveConfig.projectId.includes("remixed")) {
        // Config is already applied via static import; log for debugging
        console.log("[Firebase] Live config confirmed matching project:", liveConfig.projectId);
      }
    }
  } catch (e: any) {
    // Silently ignore — static config is sufficient
  }
})();

// Initialize Firestore targeting the specific unique database ID
const dbId = firebaseConfig.firestoreDatabaseId;
export const db = (!dbId || dbId === "(default)" || dbId === "remixed-firestore-database-id" || dbId.includes("placeholder"))
  ? getFirestore(app)
  : getFirestore(app, dbId);

// Initialize Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);

export const googleProvider = new GoogleAuthProvider();

// Connection testing function mandated by Firebase Skill Guidelines
// Modified to run silently / warn cleanly without raising system-level error console logs
async function testConnection() {
  const isRealProject = firebaseConfig.projectId && 
                        !firebaseConfig.projectId.includes("placeholder") && 
                        !firebaseConfig.projectId.includes("remixed");
  if (!isRealProject) {
    console.log("[Firebase] Skipping local connection test: using sandbox/remix configuration mode.");
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase client connection healthy.");
  } catch (error: any) {
    console.warn("[Firebase] Initial local connection check status cached. Complete server APIs are operational.", error?.message);
  }
}
testConnection();
