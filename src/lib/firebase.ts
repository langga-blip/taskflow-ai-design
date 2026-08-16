import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.setCustomParameters({
  prompt: 'select_account'
});

let cachedAccessToken: string | null = null;

export interface GoogleAuthUser {
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  uid?: string;
}

function persistGoogleToken(token: string, email?: string | null) {
  cachedAccessToken = token || null;
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('tf_google_access_token', token);
      else localStorage.removeItem('tf_google_access_token');
      if (email) localStorage.setItem('tf_google_email', email);
    }
  } catch {
    /* ignore */
  }
}

export function getStoredGoogleAccessToken(): string {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('tf_google_access_token') || '';
    }
  } catch {
    /* ignore */
  }
  return '';
}

/** True when running inside the Android APK WebView with native Google Sign-In bridge */
export function hasNativeGoogleBridge(): boolean {
  try {
    const bridge = (window as any).AndroidBridge;
    return !!(bridge && typeof bridge.signInWithGoogle === 'function');
  } catch {
    return false;
  }
}

/**
 * Prefer native Android Google Sign-In (real account picker + Gmail/Drive/Calendar scopes).
 * Falls back to Firebase popup on web. Does NOT silently invent a fake account.
 */
export const signInWithGoogle = async (): Promise<{ user: GoogleAuthUser; accessToken: string }> => {
  // 1) Native APK path — shows the real system Google account chooser
  if (hasNativeGoogleBridge()) {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('Google Sign-In timed out. Try again.'));
      }, 120000);

      const cleanup = () => {
        window.clearTimeout(timeout);
        try {
          delete (window as any).onNativeGoogleSignIn;
        } catch {
          (window as any).onNativeGoogleSignIn = undefined;
        }
      };

      (window as any).onNativeGoogleSignIn = (payload: any) => {
        cleanup();
        if (!payload || payload.success === false) {
          reject(new Error(payload?.error || 'Google Sign-In failed'));
          return;
        }
        const accessToken = payload.accessToken || '';
        persistGoogleToken(accessToken, payload.email);
        resolve({
          user: {
            displayName: payload.displayName || null,
            email: payload.email || null,
            photoURL: payload.photoUrl || null,
            uid: payload.id || payload.email || undefined,
          },
          accessToken,
        });
      };

      try {
        (window as any).AndroidBridge.signInWithGoogle();
      } catch (err: any) {
        cleanup();
        reject(new Error(err?.message || 'Could not start native Google Sign-In'));
      }
    });
  }

  // 2) Browser / AI Studio — Firebase popup with real Google accounts
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    if (token) persistGoogleToken(token, result.user.email);
    return {
      user: {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
      },
      accessToken: token || '',
    };
  } catch (error: any) {
    const errorCode = error?.code || '';
    console.warn('Firebase Google Sign-In failed:', errorCode, error?.message);
    throw new Error(
      error?.message ||
        'Google Sign-In was blocked or cancelled. On the APK, use the native Google button; on web allow popups.'
    );
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    if (hasNativeGoogleBridge()) {
      try {
        (window as any).AndroidBridge.signOutGoogle();
      } catch {
        /* ignore */
      }
    }
    await firebaseSignOut(auth);
    persistGoogleToken('');
    cachedAccessToken = null;
  } catch (err) {
    console.warn('Sign out notice:', err);
  }
};

export const getCachedAccessToken = () => getStoredGoogleAccessToken();

// Firestore sync helpers
export async function syncUserProfileToFirestore(userId: string, profile: any) {
  if (!userId) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...profile, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Firestore profile sync notice:', err);
  }
}

export async function syncTaskToFirestore(userId: string, task: any) {
  if (!userId || !task.id) return;
  try {
    const taskDocRef = doc(db, 'users', userId, 'tasks', String(task.id));
    await setDoc(taskDocRef, { ...task, userId, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Firestore task sync notice:', err);
  }
}

export async function syncWeeklyReviewToFirestore(userId: string, review: any) {
  if (!userId || !review.id) return;
  try {
    const reviewDocRef = doc(db, 'users', userId, 'reviews', String(review.id));
    await setDoc(reviewDocRef, { ...review, userId, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Firestore review sync notice:', err);
  }
}


