# Firebase Setup Instructions

This application now uses Firebase Firestore for data storage. Follow these steps to set up Firebase:

## 1. Install Firebase SDK

```bash
npm install firebase
```

## 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

## 3. Enable Firestore Database

1. In your Firebase project, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) or set up security rules
4. Select a location for your database

## 4. Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

## 5. Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase configuration values:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

## 6. Set Up Firestore Security Rules (Important!)

Go to **Firestore Database** > **Rules** and update them based on your needs:

### For Development (Test Mode):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### For Production (Recommended):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true; // Adjust based on your auth requirements
    }
    match /communities/{communityId} {
      allow read, write: if true; // Adjust based on your auth requirements
    }
    match /groups/{groupId} {
      allow read, write: if true; // Adjust based on your auth requirements
    }
    match /participants/{participantId} {
      allow read, write: if true; // Adjust based on your auth requirements
    }
  }
}
```

## 7. Restart Your Development Server

After setting up environment variables, restart your Next.js development server:

```bash
npm run dev
```

## Data Structure

The app uses the following Firestore collections:
- `rooms` - Camp room information
- `communities` - Community groups
- `groups` - Activity groups
- `participants` - Registered participants

## Troubleshooting

- **"Firebase: Error (auth/configuration-not-found)"**: Make sure your `.env.local` file exists and contains all required variables
- **"Permission denied"**: Check your Firestore security rules
- **Data not loading**: Verify your Firebase project ID and that Firestore is enabled

