import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// initialize firebase-admin once (Next.js may hot‑reload during development)
// credentials come from environment variables (required for both local and deployed environments)
function getServiceAccount() {
  console.log('[Firebase Admin] Checking for credentials...');
  console.log('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT ? 'SET' : 'NOT SET');
  console.log('[Firebase Admin] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET');
  console.log('[Firebase Admin] FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
  console.log('[Firebase Admin] FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET');

  // first preference: whole JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      console.log('[Firebase Admin] Parsing FIREBASE_SERVICE_ACCOUNT...');
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('[Firebase Admin] Parsed JSON keys:', Object.keys(parsed));
      console.log('[Firebase Admin] Project ID from JSON:', parsed.project_id);
      console.log('[Firebase Admin] Client Email from JSON:', parsed.client_email);
      console.log('[Firebase Admin] Private Key starts with:', parsed.private_key?.substring(0, 50));
      
      // ensure private key has actual newlines, not escaped ones
      if (parsed.private_key && typeof parsed.private_key === 'string') {
        console.log('[Firebase Admin] Fixing newlines in private key...');
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        console.log('[Firebase Admin] Private key after fix starts with:', parsed.private_key?.substring(0, 50));
      }
      console.log('[Firebase Admin] Successfully loaded credentials from FIREBASE_SERVICE_ACCOUNT');
      return parsed;
    } catch (err) {
      console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', err);
      throw err;
    }
  }

  // fallback: individual environment variables (works on Vercel and local)
  console.log('[Firebase Admin] Falling back to individual env vars...');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('[Firebase Admin] Missing required credentials');
    throw new Error(
      'Firebase admin credentials are not defined. ' +
        'Set FIREBASE_SERVICE_ACCOUNT or the individual FIREBASE_PROJECT_ID, ' +
        'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.'
    );
  }

  console.log('[Firebase Admin] Successfully loaded credentials from individual env vars');
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
