// ================= FIREBASE CONFIGURATION =================
// MedReach — Firebase Backend Integration
// Uses Firebase Compat SDK (CDN, no bundler required)

const firebaseConfig = {
  apiKey: "AIzaSyBlNE8irvGVVTXmaALvXfaALBBxObLVD7M",
  authDomain: "medreach-web-ac894.firebaseapp.com",
  projectId: "medreach-web-ac894",
  storageBucket: "medreach-web-ac894.firebasestorage.app",
  messagingSenderId: "634015571126",
  appId: "1:634015571126:web:e64fe10a15cc8059645a17"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase service references
const fbAuth = firebase.auth();
const fbDb = firebase.firestore();

// ================= AUTH HELPERS =================

/**
 * Convert a username + role pair into a Firebase Auth email.
 * Pattern: {username}_{role}@medreach.app
 * This allows the same username to exist for different roles.
 */
function usernameToEmail(username, role) {
  const safeUsername = (username || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  const safeRole = role === 'doctor' ? 'doctor' : 'patient';
  return `${safeUsername}.${safeRole}@medreach.app`;
}

/**
 * Sign in a user with Firebase Authentication.
 * Returns { success, uid } on success or { success: false, error, message } on failure.
 */
async function fbSignIn(username, role, password) {
  const email = usernameToEmail(username, role);
  try {
    const credential = await fbAuth.signInWithEmailAndPassword(email, password);
    return { success: true, uid: credential.user.uid };
  } catch (error) {
    return { success: false, error: error.code, message: error.message };
  }
}

/**
 * Register a new user with Firebase Authentication and save profile to Firestore.
 * Signs out after creation so the user must explicitly log in.
 */
async function fbSignUp(username, role, password, profileData) {
  const email = usernameToEmail(username, role);
  try {
    const credential = await fbAuth.createUserWithEmailAndPassword(email, password);
    const uid = credential.user.uid;

    // Store user profile in Firestore
    await fbDb.collection('users').doc(uid).set({
      username: username.trim().toLowerCase(),
      role: role,
      realEmail: profileData.email || '',
      phone: profileData.phone || '',
      state: profileData.state || '',
      address: profileData.address || '',
      displayName: profileData.displayName || username,
      isDefault: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Sign out so the user has to explicitly login
    await fbAuth.signOut();

    return { success: true, uid: uid };
  } catch (error) {
    return { success: false, error: error.code, message: error.message };
  }
}

/**
 * Sign out the current user.
 */
async function fbSignOut() {
  try {
    await fbAuth.signOut();
    return { success: true };
  } catch (error) {
    console.warn('Firebase sign out error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load a user's profile from Firestore.
 */
async function fbGetUserProfile(uid) {
  try {
    const doc = await fbDb.collection('users').doc(uid).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.warn('Failed to load user profile:', error);
    return null;
  }
}

// ================= FIRESTORE DATA HELPERS =================

/**
 * Load the global app data document from Firestore.
 * Returns the data object or null if not found / error.
 */
async function fbLoadAppData() {
  try {
    const doc = await fbDb.collection('appData').doc('global').get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.warn('Failed to load app data from Firestore:', error);
    return null;
  }
}

/**
 * Save the global app data to Firestore (merge mode).
 * This is called as fire-and-forget from the sync saveAppData().
 */
async function fbSaveAppData(data) {
  try {
    // Clean the data to avoid Firestore type issues
    const cleanData = JSON.parse(JSON.stringify(data));
    await fbDb.collection('appData').doc('global').set(cleanData);
  } catch (error) {
    console.warn('Failed to save app data to Firestore:', error);
  }
}

// ================= DEFAULT USER SETUP =================

/**
 * Ensure a default user (doctor/doctor123, patient/patient123) exists in Firebase Auth.
 * If they don't exist, create them. If they already exist, do nothing.
 */
async function fbEnsureDefaultUser(username, role, password) {
  const email = usernameToEmail(username, role);
  try {
    // Try to sign in — if successful, user already exists
    const cred = await fbAuth.signInWithEmailAndPassword(email, password);
    await fbAuth.signOut();
    return true;
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      // User doesn't exist — create them
      try {
        const credential = await fbAuth.createUserWithEmailAndPassword(email, password);
        await fbDb.collection('users').doc(credential.user.uid).set({
          username: username,
          role: role,
          realEmail: '',
          phone: '',
          state: '',
          address: '',
          displayName: username.charAt(0).toUpperCase() + username.slice(1),
          isDefault: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await fbAuth.signOut();
        console.log(`✅ Default ${role} user "${username}" created in Firebase`);
        return true;
      } catch (createError) {
        console.warn(`Failed to create default ${role} user:`, createError);
        return false;
      }
    }
    console.warn('Default user check failed:', error);
    return false;
  }
}

/**
 * Initialize all default users in Firebase Auth.
 * Called once during app startup.
 */
async function fbInitDefaultUsers(defaultCredentials) {
  const promises = [];
  for (const role of ['doctor', 'patient']) {
    if (defaultCredentials[role]) {
      for (const cred of defaultCredentials[role]) {
        promises.push(fbEnsureDefaultUser(cred.username, role, cred.password));
      }
    }
  }
  await Promise.all(promises);
}

// ================= REGISTERED DOCTORS =================

/**
 * Load all registered doctors from Firestore.
 * Returns an array of doctor profile objects.
 */
async function fbLoadRegisteredDoctors() {
  try {
    const snapshot = await fbDb.collection('users').where('role', '==', 'doctor').get();
    var doctors = [];
    snapshot.forEach(function(doc) {
      var data = doc.data();
      doctors.push({
        uid: doc.id,
        username: data.username || '',
        displayName: data.displayName || data.username || 'Doctor',
        phone: data.phone || '',
        email: data.realEmail || '',
        state: data.state || '',
        address: data.address || '',
        isDefault: !!data.isDefault,
        createdAt: data.createdAt || null
      });
    });
    return doctors;
  } catch (error) {
    console.warn('Failed to load registered doctors:', error);
    return [];
  }
}

/**
 * Save patient details (diagnosis, prescription, notes) added by a doctor.
 */
async function fbSavePatientDetails(bookingId, details) {
  try {
    var cleanDetails = JSON.parse(JSON.stringify(details));
    await fbDb.collection('patientDetails').doc(String(bookingId)).set(cleanDetails);
  } catch (error) {
    console.warn('Failed to save patient details:', error);
  }
}

// ================= DELETE ACCOUNT =================

/**
 * Delete a user account from Firebase Authentication and Firestore.
 * Requires the user to be currently signed in.
 * Returns { success: true } on success or { success: false, error, message } on failure.
 */
async function fbDeleteUserAccount() {
  try {
    const currentUser = fbAuth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'no-user', message: 'No user is currently signed in.' };
    }

    const uid = currentUser.uid;

    // Delete user document from Firestore
    await fbDb.collection('users').doc(uid).delete();

    // Delete user from Firebase Authentication
    await currentUser.delete();

    return { success: true };
  } catch (error) {
    console.warn('Failed to delete user account:', error);
    return { success: false, error: error.code, message: error.message };
  }
}

console.log('🔥 Firebase initialized for MedReach');