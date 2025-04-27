// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import config from './config.js';

// Initialize Firebase
const app = initializeApp(config.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const startLearningBtn = document.getElementById('startLearningBtn');

// Get the current roadmap ID from the URL
function getRoadmapId() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('-path.html', '');
}

// Handle authentication state
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../login.html';
    } else {
        // Load user progress for this roadmap
        await loadUserProgress(user.uid, getRoadmapId());
    }
});

// Load user progress
async function loadUserProgress(userId, roadmapId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const activePath = userData.activePath;
            
            // If this is the user's active path, update the start button
            if (activePath === roadmapId) {
                if (startLearningBtn) {
                    startLearningBtn.innerHTML = '<i class="fas fa-play"></i> Continue Learning';
                }
            }
        }
    } catch (error) {
        console.error('Error loading user progress:', error);
    }
}

// Handle start learning button
if (startLearningBtn) {
    startLearningBtn.addEventListener('click', async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const roadmapId = getRoadmapId();
                
                // Update user's active path
                await updateDoc(doc(db, 'users', user.uid), {
                    activePath: roadmapId
                });
                
                // Redirect to the first module or show a success message
                alert('You have started the ' + roadmapId + ' learning path!');
            }
        } catch (error) {
            console.error('Error starting learning path:', error);
        }
    });
}

// Handle logout
function handleLogout() {
    signOut(auth).then(() => {
        window.location.href = '../login.html';
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}); 