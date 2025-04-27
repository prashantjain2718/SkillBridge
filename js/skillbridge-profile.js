// SkillBridge: Dynamic Profile Display (modular, non-intrusive)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import config from './config.js';

const app = initializeApp(config.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const userName = document.getElementById('userName');
  const userEmail = document.getElementById('userEmail');
  const userBio = document.getElementById('userBio');
  const skillsToShareBox = document.getElementById('skillsToShareBox');
  const skillsToLearnBox = document.getElementById('skillsToLearnBox');
  const addSkillToShareBtn = document.getElementById('addSkillToShareBtn');
  const addSkillToLearnBtn = document.getElementById('addSkillToLearnBtn');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const profileEditModal = document.getElementById('profileEditModal');
  const closeEditModal = document.getElementById('closeEditModal');
  const profileEditForm = document.getElementById('profileEditForm');
  const profilePic = document.getElementById('profilePic');

  let currentUserData = {};
  let currentUser = null;

  // Utility: Render skills with instant remove
  function renderSkills(skills, container, removeHandler) {
    container.innerHTML = '';
    if (skills && skills.length > 0) {
      skills.forEach((skill, idx) => {
        const span = document.createElement('span');
        span.className = 'skill-chip';
        span.textContent = skill;
        // Add remove button
        const btn = document.createElement('button');
        btn.className = 'remove-skill-btn';
        btn.innerHTML = '&times;';
        btn.onclick = (e) => {
          e.preventDefault();
          removeHandler(idx);
        };
        span.appendChild(btn);
        container.appendChild(span);
      });
    } else {
      container.innerHTML = '<span style="color:#aaa;">No skills listed</span>';
    }
  }

  // Auth state
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '../login.html';
      return;
    }
    currentUser = user;
    userName.textContent = user.displayName || "No Name";
    userEmail.textContent = user.email || "No Email";
    userBio.textContent = "Loading bio...";

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        currentUserData = userDoc.data();

        // Display info
        if (currentUserData.displayName) userName.textContent = currentUserData.displayName;
        userBio.textContent = currentUserData.bio || "Student on SkillBridge";
        if (currentUserData.photoURL) profilePic.src = currentUserData.photoURL;
        else profilePic.src = "../assets/profile-placeholder.png";

        // Render skills
        renderSkills(currentUserData.skillsTeach || [], skillsToShareBox, removeSkillToShare);
        renderSkills(currentUserData.skillsLearn || [], skillsToLearnBox, removeSkillToLearn);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      userBio.textContent = "Error loading profile data";
    }
  });

  // Add skill to share
  if (addSkillToShareBtn) {
    addSkillToShareBtn.onclick = async () => {
      const input = document.getElementById('newSkillToShareInput');
      const skill = input.value.trim();
      if (skill && currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        let currentSkills = userDoc.data()?.skillsTeach || [];
        if (!currentSkills.includes(skill)) {
          currentSkills.push(skill);
          await setDoc(userRef, { skillsTeach: currentSkills }, { merge: true });
          renderSkills(currentSkills, skillsToShareBox, removeSkillToShare);
        }
        input.value = '';
      }
    };
  }

  // Add skill to learn
  if (addSkillToLearnBtn) {
    addSkillToLearnBtn.onclick = async () => {
      const input = document.getElementById('newSkillToLearnInput');
      const skill = input.value.trim();
      if (skill && currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        let currentSkills = userDoc.data()?.skillsLearn || [];
        if (!currentSkills.includes(skill)) {
          currentSkills.push(skill);
          await setDoc(userRef, { skillsLearn: currentSkills }, { merge: true });
          renderSkills(currentSkills, skillsToLearnBox, removeSkillToLearn);
        }
        input.value = '';
      }
    };
  }

  // Remove skill to share (INSTANT)
  async function removeSkillToShare(idx) {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userRef);
    let currentSkills = userDoc.data()?.skillsTeach || [];
    currentSkills.splice(idx, 1);
    await setDoc(userRef, { skillsTeach: currentSkills }, { merge: true });
    renderSkills(currentSkills, skillsToShareBox, removeSkillToShare);
  }

  // Remove skill to learn (INSTANT)
  async function removeSkillToLearn(idx) {
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userRef);
    let currentSkills = userDoc.data()?.skillsLearn || [];
    currentSkills.splice(idx, 1);
    await setDoc(userRef, { skillsLearn: currentSkills }, { merge: true });
    renderSkills(currentSkills, skillsToLearnBox, removeSkillToLearn);
  }

  // Edit modal open/close
  if (editProfileBtn) {
    editProfileBtn.onclick = () => {
      document.getElementById('editName').value = currentUser.displayName || '';
      document.getElementById('editEmail').value = currentUser.email || '';
      document.getElementById('editMobile').value = currentUserData.mobile || '';
      document.getElementById('editBio').value = currentUserData.bio || '';
      // DO NOT set fileInput.required at all!
      profileEditModal.style.display = 'block';
    };
  }
  if (closeEditModal) {
    closeEditModal.onclick = () => {
      profileEditModal.style.display = 'none';
    };
  }

  // Edit profile form submit (photo is optional)
  if (profileEditForm) {
    profileEditForm.onsubmit = async (e) => {
      e.preventDefault();
      console.log("Form submitted!"); // Debug
      const newName = document.getElementById('editName').value.trim();
      const newEmail = document.getElementById('editEmail').value.trim();
      const newMobile = document.getElementById('editMobile').value.trim();
      const newBio = document.getElementById('editBio').value.trim();
      const profilePicFile = document.getElementById('editProfilePic').files[0];
      const msgDiv = document.getElementById('profileEditMsg');
      msgDiv.textContent = '';

      try {
        // Update Auth profile
        if (currentUser.displayName !== newName) {
          await updateProfile(currentUser, { displayName: newName });
          console.log("Display name updated");
        }
        if (currentUser.email !== newEmail) {
          await currentUser.updateEmail(newEmail); // May require re-auth
          console.log("Email updated");
        }

        let photoURL = currentUserData.photoURL || "";
        if (profilePicFile) {
          const fileRef = storageRef(storage, `profile_pics/${currentUser.uid}`);
          await uploadBytes(fileRef, profilePicFile);
          photoURL = await getDownloadURL(fileRef);
          await updateProfile(currentUser, { photoURL });
          console.log("Photo updated");
        }

        await setDoc(doc(db, "users", currentUser.uid), {
          displayName: newName,
          email: newEmail,
          mobile: newMobile,
          bio: newBio,
          photoURL
        }, { merge: true });
        console.log("Firestore updated");

        msgDiv.textContent = "Profile updated!";
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        msgDiv.textContent = "Error: " + err.message;
        console.error(err);
      }
    };
  }
});

