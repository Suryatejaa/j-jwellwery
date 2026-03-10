import fs from 'fs';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// initialize firebase-admin once (Next.js may hot‑reload during development)
// credentials can come from either a single JSON string, separate env vars,
// or a path to a service account file on disk (local dev only).
function getServiceAccount() {
  // first preference: explicit file path (local development only)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const filePath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(filePath)) {
        const contents = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(contents);
      }
      // file doesn't exist; continue to next method
    } catch (err) {
      console.warn('Failed to load service account file, trying env vars:', err);
      // continue to next method
    }
  }

  // next preference: whole JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err);
      throw err;
    }
  }

  // fallback: individual pieces
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase admin credentials are not defined. ' +
        'Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT, or ' +
        'the individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and ' +
        'FIREBASE_PRIVATE_KEY environment variables.'
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
