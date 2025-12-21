# Firebase Setup Guide

This project now uses Firebase Firestore to sync messages and countdown hits across all devices and browsers. Follow these steps to set up Firebase:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard (you can disable Google Analytics if you want)

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build** > **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for now - you can secure it later)
4. Select a location close to your users
5. Click **Enable**

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app (give it a name like "Master Project")
5. Copy the `firebaseConfig` object that appears

## Step 4: Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** > **Rules** tab
2. Replace the default rules with these (allows read/write for now - you can restrict later):

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

3. Click **Publish**

**Note:** For production, you should add proper authentication and security rules. The above rules allow anyone to read/write, which is fine for a personal project but not for public apps.

## Step 6: Test Your Setup

1. Open your site (locally or on GitHub Pages)
2. Go to the admin portal (enter the admin password)
3. Try adding a message and clicking "Save Messages"
4. Check Firebase Console > Firestore Database to see if the data appears
5. Open the site on a different device/browser - the message should appear there too!

## Troubleshooting

- **"Firebase SDK not loaded"**: Make sure the Firebase script tags are in your HTML files
- **"Permission denied"**: Check your Firestore security rules
- **Data not syncing**: Check browser console for errors and verify your Firebase config is correct

## How It Works

- Messages are stored in Firestore collection: `messages`
- Hit timestamps are stored in Firestore collection: `hits`
- The code automatically falls back to localStorage if Firebase fails (for backward compatibility)
- Real-time updates: Changes made on one device appear instantly on others

## Security Note

For a personal project, the current setup is fine. If you want to secure it:
1. Enable Firebase Authentication
2. Update Firestore rules to require authentication
3. Add user management in your admin portal

