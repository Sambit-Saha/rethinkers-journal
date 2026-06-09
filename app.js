import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// =======================
// FIREBASE CONFIG
// =======================
const firebaseConfig = {
  apiKey: "AIzaSyADuJpYlXLuX8dfmX2KSnlO0KJiqQ8Ba80",
  authDomain: "rethinkers-journal.firebaseapp.com",
  projectId: "rethinkers-journal",
  storageBucket: "rethinkers-journal.appspot.com",
  messagingSenderId: "842949343385",
  appId: "1:842949343385:web:adc684cddcdad6f4d72008"
};


// =======================
// INIT
// =======================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;


// =======================
// SAFE UI ELEMENTS
// =======================
const loginBtn = document.getElementById("loginBtn");
const postBtn = document.getElementById("postBtn");
const logoutBtn = document.getElementById("logoutBtn");
const avatar = document.getElementById("avatar");

const form = document.getElementById("submission-form");

// BOTH PAGES SUPPORT
const dashboardContainer = document.getElementById("articles-container");
const homeContainer = document.getElementById("posts-container");


// =======================
// AUTH STATE
// =======================
onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
        if (loginBtn) loginBtn.style.display = "none";
        if (postBtn) postBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "inline-block";

        if (avatar) {
            avatar.style.display = "flex";
            avatar.textContent = user.email?.charAt(0).toUpperCase();
        }
    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (postBtn) postBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "none";

        if (avatar) avatar.style.display = "none";
    }
});


// =======================
// LOGOUT
// =======================
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
    });
}


// =======================
// SCROLL TO POST SECTION
// =======================
if (postBtn) {
    postBtn.addEventListener("click", () => {
        const publish = document.getElementById("publish");
        if (publish) publish.scrollIntoView({ behavior: "smooth" });
    });
}


// =======================
// POST SUBMIT (FULL FIXED)
// =======================
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        console.log("Publish clicked");

        if (!currentUser) {
            alert("Please login first");
            return;
        }

        const category = document.getElementById("sub-category")?.value;
        const author = document.getElementById("sub-author")?.value;
        const title = document.getElementById("sub-title")?.value;
        const content = document.getElementById("sub-content")?.value;

        if (!category || !author || !title || !content) {
            alert("Please fill all fields");
            return;
        }

        try {
            await addDoc(collection(db, "posts"), {
                category,
                author,
                title,
                content,
                email: currentUser.email,
                time: serverTimestamp()
            });

            console.log("Post published successfully");
            alert("Post published!");

            form.reset();

        } catch (err) {
            console.error("Firestore write error:", err);
            alert(err.message);
        }
    });
}


// =======================
// LIVE POSTS (WORKS ON BOTH PAGES)
// =======================
const q = query(collection(db, "posts"), orderBy("time", "desc"));

onSnapshot(q, (snapshot) => {

    console.log("Live posts updated:", snapshot.size);

    if (dashboardContainer) dashboardContainer.innerHTML = "";
    if (homeContainer) homeContainer.innerHTML = "";

    snapshot.forEach((doc) => {
        const data = doc.data();

        const cardHTML = `
            <div class="card">
                <span class="tag">${data.category || ""}</span>
                <h4>${data.title || ""}</h4>
                <p>${data.content || ""}</p>
                <small>By ${data.author || "Unknown"} | ${data.email || ""}</small>
            </div>
        `;

        if (dashboardContainer) {
            dashboardContainer.innerHTML += cardHTML;
        }

        if (homeContainer) {
            homeContainer.innerHTML += cardHTML;
        }
    });

}, (error) => {
    console.error("Firestore read error:", error);
});