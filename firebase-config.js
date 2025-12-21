// Firebase Configuration
// IMPORTANT: Replace these values with your Firebase project credentials
// Get them from: https://console.firebase.google.com/ > Project Settings > General > Your apps

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (only if not already initialized)
let db = null;
if (typeof firebase === 'undefined') {
  console.error('Firebase SDK not loaded. Make sure to include Firebase scripts in your HTML.');
} else {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  // Firestore helper functions
  db = firebase.firestore();
}

// Storage keys mapping
const STORAGE_KEYS = {
  messages: {
    'ist': 'message_ist',
    'qatar': 'message_qatar',
    'qatar-birth': 'message_qatar_birth'
  },
  hits: {
    'ist': 'lastHit_ist',
    'qatar': 'lastHit_qatar',
    'qatar-birth': 'lastHit_qatar_birth'
  }
};

// Get message from Firestore
async function getMessage(sectionKey) {
  if (!db) {
    // Firebase not initialized, fallback to localStorage
    return localStorage.getItem('message_' + sectionKey);
  }
  try {
    const doc = await db.collection('messages').doc(STORAGE_KEYS.messages[sectionKey]).get();
    if (doc.exists) {
      return doc.data().content || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting message:', error);
    // Fallback to localStorage for backward compatibility
    return localStorage.getItem('message_' + sectionKey);
  }
}

// Save message to Firestore
async function saveMessage(sectionKey, content) {
  // Always save to localStorage as backup
  if (content) {
    localStorage.setItem('message_' + sectionKey, content);
  } else {
    localStorage.removeItem('message_' + sectionKey);
  }
  
  if (!db) {
    // Firebase not initialized, only use localStorage
    return false;
  }
  try {
    await db.collection('messages').doc(STORAGE_KEYS.messages[sectionKey]).set({
      content: content,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving message:', error);
    // Fallback to localStorage
    if (content) {
      localStorage.setItem('message_' + sectionKey, content);
    } else {
      localStorage.removeItem('message_' + sectionKey);
    }
    return false;
  }
}

// Get last hit timestamp from Firestore
async function getLastHit(sectionKey) {
  const key = sectionKey === 'qatar-birth' ? 'lastHit_qatar_birth' : 
              (sectionKey === 'qatar' ? 'lastHit_qatar' : 'lastHit_ist');
  
  if (!db) {
    // Firebase not initialized, fallback to localStorage
    return Number(localStorage.getItem(key) || 0);
  }
  try {
    const doc = await db.collection('hits').doc(STORAGE_KEYS.hits[sectionKey]).get();
    if (doc.exists) {
      const data = doc.data();
      return data.timestamp ? Number(data.timestamp) : 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting last hit:', error);
    // Fallback to localStorage
    return Number(localStorage.getItem(key) || 0);
  }
}

// Save last hit timestamp to Firestore
async function saveLastHit(sectionKey, timestamp) {
  const key = sectionKey === 'qatar-birth' ? 'lastHit_qatar_birth' : 
              (sectionKey === 'qatar' ? 'lastHit_qatar' : 'lastHit_ist');
  
  // Always save to localStorage as backup
  localStorage.setItem(key, String(timestamp));
  
  if (!db) {
    // Firebase not initialized, only use localStorage
    return false;
  }
  try {
    await db.collection('hits').doc(STORAGE_KEYS.hits[sectionKey]).set({
      timestamp: String(timestamp),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error saving last hit:', error);
    return false;
  }
}

// Remove last hit from Firestore
async function removeLastHit(sectionKey) {
  const key = sectionKey === 'qatar-birth' ? 'lastHit_qatar_birth' : 
              (sectionKey === 'qatar' ? 'lastHit_qatar' : 'lastHit_ist');
  
  // Always remove from localStorage
  localStorage.removeItem(key);
  
  if (!db) {
    // Firebase not initialized, only use localStorage
    return false;
  }
  try {
    await db.collection('hits').doc(STORAGE_KEYS.hits[sectionKey]).delete();
    return true;
  } catch (error) {
    console.error('Error removing last hit:', error);
    return false;
  }
}

// Listen to real-time updates for a message
function onMessageUpdate(sectionKey, callback) {
  if (!db) {
    // Firebase not initialized, return callback with localStorage value
    callback(localStorage.getItem('message_' + sectionKey));
    return () => {}; // Return empty unsubscribe function
  }
  return db.collection('messages').doc(STORAGE_KEYS.messages[sectionKey])
    .onSnapshot((doc) => {
      if (doc.exists) {
        callback(doc.data().content || null);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error listening to message updates:', error);
      callback(localStorage.getItem('message_' + sectionKey));
    });
}

// Listen to real-time updates for a hit
function onHitUpdate(sectionKey, callback) {
  const key = sectionKey === 'qatar-birth' ? 'lastHit_qatar_birth' : 
              (sectionKey === 'qatar' ? 'lastHit_qatar' : 'lastHit_ist');
  
  if (!db) {
    // Firebase not initialized, return callback with localStorage value
    callback(Number(localStorage.getItem(key) || 0));
    return () => {}; // Return empty unsubscribe function
  }
  return db.collection('hits').doc(STORAGE_KEYS.hits[sectionKey])
    .onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        callback(data.timestamp ? Number(data.timestamp) : 0);
      } else {
        callback(0);
      }
    }, (error) => {
      console.error('Error listening to hit updates:', error);
      callback(Number(localStorage.getItem(key) || 0));
    });
}

