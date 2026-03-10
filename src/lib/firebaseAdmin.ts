import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// initialize firebase-admin once (Next.js may hot‑reload during development)
// credentials come from environment variables (required for both local and deployed environments)
function getServiceAccount() {
  // first preference: whole JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err);
      throw err;
    }
  }

  // primary: individual environment variables (works on Vercel and local)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase admin credentials are not defined. ' +
        'Set FIREBASE_SERVICE_ACCOUNT or the individual FIREBASE_PROJECT_ID, ' +
        'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.'
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(getServiceAccount()),
    })
  : getApps()[0];

export const adminDb = getFirestore(adminApp);
