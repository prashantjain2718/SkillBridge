import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import config from './config.js';

const app = initializeApp(config.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('signupError');
    const successDiv = document.getElementById('signupSuccess');
    errorDiv.textContent = '';
    successDiv.textContent = '';

    if (password !== confirmPassword) {
      errorDiv.textContent = "Passwords do not match.";
      return;
    }
    if (password.length < 6) {
      errorDiv.textContent = "Password should be at least 6 characters.";
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Save user data to Firestore before redirecting
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: name,
        email: email,
        skillsTeach: [],
        skillsLearn: []
      });
      
      successDiv.textContent = "Signup successful! Redirecting to login...";
      setTimeout(() => window.location.href = "login.html", 1200);
    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });
} 