import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import config from './config.js';

// Initialize Firebase
const app = initializeApp(config.firebase);
const auth = getAuth(app);

// Export auth instance
export { auth };

// Authentication state management
export function initializeAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user);
        });
    });
}

// Check if user is authenticated
export function checkAuth() {
    return auth.currentUser;
}

// Handle logout
export async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Protect route - redirect to login if not authenticated
export function protectRoute() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '../login.html';
        }
    });
} 