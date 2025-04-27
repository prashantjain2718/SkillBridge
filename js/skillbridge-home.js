import { auth, initializeAuth, checkAuth, handleLogout, protectRoute } from '../js/auth.js';
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore();

// Get DOM elements
const userGreeting = document.getElementById('userGreeting');
const matchesGrid = document.getElementById('matchesGrid');
const logoutBtn = document.getElementById('logoutBtn');
const skillSearch = document.getElementById('skillSearch');
const skillTypeFilter = document.getElementById('skillTypeFilter');
const learningPathsLink = document.getElementById('learningPathsLink');

// Initialize authentication and protect route
protectRoute();

// Handle user authentication state
initializeAuth().then(async (user) => {
    if (user) {
        userGreeting.textContent = `Welcome, ${user.displayName || 'User'}`;
        await loadUsers();
    }
});

// Load and display users
async function loadUsers() {
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = [];
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        name: userData.displayName,
        skillsTeach: userData.skillsTeach || [],
        skillsLearn: userData.skillsLearn || []
      });
    });
    
    if (users.length === 0) {
      matchesGrid.innerHTML = '<div class="error-message">No users found in the system.</div>';
      return;
    }
    
    displayUsers(users);
  } catch (error) {
    console.error("Error loading users:", error);
    matchesGrid.innerHTML = '<div class="error-message">Error loading users. Please try again later.</div>';
  }
}

// Display users in the grid
function displayUsers(users) {
  matchesGrid.innerHTML = '';
  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    userCard.innerHTML = `
      <div class="user-card-header">
        <h3>${user.name}</h3>
      </div>
      <div class="user-skills">
        <div class="skills-section">
          <h4>Skills to Share</h4>
          <div class="skill-chips">
            ${user.skillsTeach.length > 0 
              ? user.skillsTeach.map(skill => `<span class="skill-chip">${skill}</span>`).join('')
              : '<span class="no-skills">No skills listed</span>'}
          </div>
        </div>
        <div class="skills-section">
          <h4>Skills to Learn</h4>
          <div class="skill-chips">
            ${user.skillsLearn.length > 0 
              ? user.skillsLearn.map(skill => `<span class="skill-chip">${skill}</span>`).join('')
              : '<span class="no-skills">No skills listed</span>'}
          </div>
        </div>
      </div>
    `;
    matchesGrid.appendChild(userCard);
  });
}

// Handle learning paths link click
learningPathsLink.addEventListener('click', (e) => {
    e.preventDefault();
    const user = checkAuth();
    if (user) {
        window.location.href = 'learning-paths.html';
    }
});

// Handle logout
logoutBtn.addEventListener('click', handleLogout);

// Handle search and filter
if (skillSearch && skillTypeFilter) {
  skillSearch.addEventListener('input', filterUsers);
  skillTypeFilter.addEventListener('change', filterUsers);
}

async function filterUsers() {
  const searchTerm = skillSearch.value.toLowerCase();
  const filterType = skillTypeFilter.value;
  
  try {
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    const users = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData && userData.email) {
        const displayName = userData.displayName || userData.email.split('@')[0];
        const email = userData.email;
        const skillsTeach = userData.skillsTeach || [];
        const skillsLearn = userData.skillsLearn || [];
        
        // Filter based on search term and filter type
        const matchesSearch = displayName.toLowerCase().includes(searchTerm) ||
          email.toLowerCase().includes(searchTerm) ||
          skillsTeach.some(skill => skill.toLowerCase().includes(searchTerm)) ||
          skillsLearn.some(skill => skill.toLowerCase().includes(searchTerm));
        
        const matchesFilter = filterType === 'all' ||
          (filterType === 'share' && skillsTeach.length > 0) ||
          (filterType === 'learn' && skillsLearn.length > 0);
        
        if (matchesSearch && matchesFilter) {
          users.push({
            id: doc.id,
            displayName,
            email,
            skillsTeach,
            skillsLearn
          });
        }
      }
    });
    
    displayUsers(users);
  } catch (error) {
    console.error("Error filtering users:", error);
    matchesGrid.innerHTML = '<div class="error-message">Error filtering users. Please try again later.</div>';
  }
} 