import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import config from './config.js';

// Initialize Firebase
const app = initializeApp(config.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const stageHeaders = document.querySelectorAll('.stage-header');
const progressTracker = document.querySelector('.progress-tracker');
const progressList = document.querySelector('.progress-list');
const showMoreBtn = document.getElementById('showMoreBtn');

// Handle authentication state
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = '../login.html';
    } else {
        await loadUserProgress(user.uid);
        setupCollapsibleSections();
        setupShowMoreButton();
    }
});

// Setup show more button
function setupShowMoreButton() {
    const stages = document.querySelectorAll('.roadmap-stage');
    const visibleStages = 2; // Number of stages to show initially
    
    // Hide all stages except the first two
    stages.forEach((stage, index) => {
        if (index >= visibleStages) {
            stage.style.display = 'none';
        }
    });

    // Show the button if there are more stages
    if (stages.length > visibleStages) {
        showMoreBtn.style.display = 'block';
    }

    // Add click handler to show more button
    showMoreBtn.addEventListener('click', () => {
        stages.forEach((stage, index) => {
            if (index >= visibleStages) {
                stage.style.display = 'block';
                // Add animation class
                stage.classList.add('fade-in');
            }
        });
        showMoreBtn.style.display = 'none';
    });
}

// Setup collapsible sections
function setupCollapsibleSections() {
    // Initially show only the first stage's content
    const stages = document.querySelectorAll('.roadmap-stage');
    stages.forEach((stage, index) => {
        const content = stage.querySelector('.stage-content');
        if (index > 0) {
            content.style.maxHeight = '0';
        }
    });

    // Add click handlers to stage headers
    stageHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isExpanded = content.style.maxHeight === '2000px';
            
            // Toggle the expanded class
            header.classList.toggle('expanded');
            content.style.maxHeight = isExpanded ? '0' : '2000px';
            
            // Animate the chevron
            const chevron = header.querySelector('i.fa-chevron-down');
            if (chevron) {
                chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    });
}

// Load user progress
async function loadUserProgress(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const completedTopics = userData.completedTopics || [];
            
            // Update UI with completed topics
            completedTopics.forEach(topicId => {
                const topicCard = document.getElementById(topicId);
                if (topicCard) {
                    topicCard.classList.add('completed');
                }
            });
            
            // Update progress tracker
            updateProgressTracker(completedTopics);
        }
    } catch (error) {
        console.error('Error loading user progress:', error);
    }
}

// Update progress tracker
function updateProgressTracker(completedTopics) {
    const topics = document.querySelectorAll('.topic-card');
    const totalTopics = topics.length;
    const completedCount = completedTopics.length;
    
    // Update progress percentage
    const progressPercentage = Math.round((completedCount / totalTopics) * 100);
    document.querySelector('.progress-percentage').textContent = `${progressPercentage}%`;
    
    // Update progress items
    topics.forEach(topic => {
        const topicId = topic.id;
        const isCompleted = completedTopics.includes(topicId);
        const progressItem = document.querySelector(`.progress-item[data-topic="${topicId}"]`);
        
        if (progressItem) {
            progressItem.classList.toggle('completed', isCompleted);
        }
    });
}

// Handle logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
});

// Add smooth scrolling for progress tracker items
document.querySelectorAll('.progress-item').forEach(item => {
    item.addEventListener('click', () => {
        const topicId = item.getAttribute('data-topic');
        const topicElement = document.getElementById(topicId);
        if (topicElement) {
            topicElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
}); 