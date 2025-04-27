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
const startPathBtns = document.querySelectorAll('.start-path-btn');
const showMoreBtn = document.getElementById('showMoreBtn');
const hiddenPaths = document.querySelectorAll('.hidden-path');

// Handle authentication state
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../login.html';
    } else {
        await loadUserProgress(user.uid);
    }
});

// Load user progress
async function loadUserProgress(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const activePath = userData.activePath;
            
            // Update UI with active path
            if (activePath) {
                const pathCard = document.getElementById(`${activePath}-path`);
                if (pathCard) {
                    pathCard.classList.add('active');
                    const startBtn = pathCard.querySelector('.start-path-btn');
                    startBtn.textContent = 'Continue Learning';
                }
            }
        }
    } catch (error) {
        console.error('Error loading user progress:', error);
    }
}

// Handle path selection
startPathBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const path = btn.getAttribute('data-path');
        
        try {
            const user = auth.currentUser;
            if (user) {
                // Update user's active path
                await updateDoc(doc(db, 'users', user.uid), {
                    activePath: path
                });
                
                // Redirect to the selected path
                window.location.href = `path-${path}.html`;
            }
        } catch (error) {
            console.error('Error selecting path:', error);
        }
    });
});

// Show More Button functionality
showMoreBtn.addEventListener('click', () => {
    const isExpanded = showMoreBtn.classList.contains('expanded');
    
    if (!isExpanded) {
        // Show hidden paths
        hiddenPaths.forEach(path => {
            path.classList.add('visible');
        });
        showMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
    } else {
        // Hide paths
        hiddenPaths.forEach(path => {
            path.classList.remove('visible');
        });
        showMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show More';
    }
    
    showMoreBtn.classList.toggle('expanded');
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}); 