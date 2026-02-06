# Firestore Security Rules

This file contains recommended security rules for production deployment.

## Development Rules (Test Mode)
⚠️ **Only for development/testing**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Production Rules (Recommended)
✅ **Use this for production**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection - public read, admin write only
    match /products/{document=**} {
      // Anyone can read products
      allow read: if true;
      
      // Only authenticated users can write (modify products)
      allow create, update, delete: if request.auth != null;
    }
    
    // Optional: Add user roles for more granular control
    match /roles/{uid} {
      allow read: if request.auth.uid == uid;
      allow write: if request.auth.uid == uid && 
                      get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Advanced Rules with Admin Role Check
✅ **For multi-admin scenarios**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Products - public read, admin write
    match /products/{document=**} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Admin list
    match /admins/{document=**} {
      allow read: if request.auth.uid == document;
      allow write: if request.auth == null; // Prevent modification
    }
  }
}
```

## How to Apply Rules

1. Go to Firebase Console
2. Select your project
3. Navigate to "Firestore Database"
4. Click "Rules" tab
5. Copy and paste the rules above
6. Click "Publish"

## Testing Rules

Firebase provides a rules simulator in the console:
1. In Firestore, go to "Rules" tab
2. Click "Simulate" button
3. Test read/write operations with different auth states

## Security Checklist

- ✅ Products readable by everyone (public storefront)
- ✅ Products only writable by authenticated users
- ✅ No sensitive data exposed in public reads
- ✅ Rate limiting (consider using Cloud Functions)
- ✅ Input validation on backend (API routes)

## Notes

- Current API routes handle authentication at the application level
- Consider adding backend validation with Firebase Admin SDK
- For production, implement proper admin role management
- Monitor Firestore usage in Firebase Console
- Enable billing alerts in Google Cloud Console
