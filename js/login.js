// Only import ONCE at the top
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import config from './config.js';

// Only declare config/app/auth/db ONCE
const app = initializeApp(config.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

// --- LOGIN ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('loginSuccess');
    errorDiv.textContent = '';
    successDiv.textContent = '';
    try {
      await signInWithEmailAndPassword(auth, email, password);
      successDiv.textContent = "Login successful! Redirecting...";
      setTimeout(() => window.location.href = "pages/home.html", 1000);
    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });
}

// --- SIGNUP ---
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
      successDiv.textContent = "Signup successful! Redirecting to login...";
      setTimeout(() => window.location.href = "login.html", 1200);
    } catch (err) {
      errorDiv.textContent = err.message;
    }
  });

  // Dynamically add skill fields
  const teachInput = document.createElement('input');
  teachInput.type = "text";
  teachInput.id = "teachSkills";
  teachInput.placeholder = "Skills you can teach (comma separated)";
  teachInput.style.marginBottom = "0.7rem";
  signupForm.insertBefore(teachInput, signupForm.querySelector('button'));

  const learnInput = document.createElement('input');
  learnInput.type = "text";
  learnInput.id = "learnSkills";
  learnInput.placeholder = "Skills you want to learn (comma separated)";
  learnInput.style.marginBottom = "0.7rem";
  signupForm.insertBefore(learnInput, signupForm.querySelector('button'));

  // Listen for successful signup (user is redirected to login after signup)
  signupForm.addEventListener('submit', async function(e) {
    setTimeout(() => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Save skills to Firestore
          const teachSkills = teachInput.value.split(',').map(s => s.trim()).filter(Boolean);
          const learnSkills = learnInput.value.split(',').map(s => s.trim()).filter(Boolean);
          await setDoc(doc(db, "users", user.uid), {
            displayName: user.displayName,
            email: user.email,
            skillsTeach: teachSkills,
            skillsLearn: learnSkills
          }, { merge: true });
        }
      });
    }, 2000); // Wait for signup to complete and redirect
  });
}

// --- (Other features: Only run if relevant DOM elements exist) ---
// For example, skill modal, profile, search, etc.
// ... (add your modular code here, always checking for the right DOM elements)

// SkillBridge: Profile Management (modular, non-intrusive)
const profileDiv = document.getElementById('profileSection');
if (profileDiv) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      profileDiv.innerHTML = "Please log in to view your profile.";
      return;
    }
    // Fetch user data
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const data = userDoc.exists() ? userDoc.data() : {};
    profileDiv.innerHTML = `
      <form id="profileForm">
        <label>Name:</label>
        <input type="text" id="profileName" value="${user.displayName || ''}">
        <label>Email:</label>
        <input type="email" id="profileEmail" value="${user.email || ''}" disabled>
        <label>Skills I can teach:</label>
        <input type="text" id="profileTeach" value="${(data.skillsTeach || []).join(', ')}">
        <label>Skills I want to learn:</label>
        <input type="text" id="profileLearn" value="${(data.skillsLearn || []).join(', ')}">
        <button type="submit">Save</button>
        <div id="profileMsg"></div>
      </form>
    `;
    document.getElementById('profileForm').onsubmit = async function(e) {
      e.preventDefault();
      const newName = document.getElementById('profileName').value.trim();
      const newTeach = document.getElementById('profileTeach').value.split(',').map(s => s.trim()).filter(Boolean);
      const newLearn = document.getElementById('profileLearn').value.split(',').map(s => s.trim()).filter(Boolean);
      await updateProfile(user, { displayName: newName });
      await setDoc(doc(db, "users", user.uid), {
        displayName: newName,
        skillsTeach: newTeach,
        skillsLearn: newLearn
      }, { merge: true });
      document.getElementById('profileMsg').textContent = "Profile updated!";
    };
  });
}

// SkillBridge: Skill Search (modular, non-intrusive)
const searchDiv = document.getElementById('searchSection');
if (searchDiv) {
  searchDiv.innerHTML = `
    <input type="text" id="searchSkill" placeholder="Search for a skill...">
    <button id="searchBtn">Search</button>
    <div id="searchResults"></div>
  `;
  document.getElementById('searchBtn').onclick = async () => {
    const skill = document.getElementById('searchSkill').value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');
    if (!skill) return;
    resultsDiv.textContent = "Searching...";
    const usersSnap = await getDocs(collection(db, "users"));
    let found = [];
    usersSnap.forEach(doc => {
      const data = doc.data();
      const teach = (data.skillsTeach || []).map(s => s.toLowerCase());
      if (teach.includes(skill)) {
        found.push(data);
      }
    });
    if (found.length === 0) {
      resultsDiv.textContent = "No users found for this skill.";
      return;
    }
    resultsDiv.innerHTML = found.map(user => `
      <div class="user-card">
        <strong>${user.displayName || user.email}</strong><br>
        <span>Teaches: ${(user.skillsTeach || []).join(', ')}</span><br>
        <span>Wants: ${(user.skillsLearn || []).join(', ')}</span><br>
        <button class="btn btn-primary connectBtn">Connect</button>
      </div>
    `).join('');
  };
}

