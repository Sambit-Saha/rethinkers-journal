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


// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyADuJpYlXLuX8dfmX2KSnlO0KJiqQ8Ba80",
  authDomain: "rethinkers-journal.firebaseapp.com",
  projectId: "rethinkers-journal",
  storageBucket: "rethinkers-journal.appspot.com",
  messagingSenderId: "842949343385",
  appId: "1:842949343385:web:adc684cddcdad6f4d72008"
};


// INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;


// =======================
// SAFE ELEMENT GETTER
// =======================
const loginBtn = document.getElementById("loginBtn");
const postBtn = document.getElementById("postBtn");
const logoutBtn = document.getElementById("logoutBtn");
const avatar = document.getElementById("avatar");

const articlesContainer = document.getElementById("articles-container");
const form = document.getElementById("submission-form");


// =======================
// AUTH STATE (SAFE)
// =======================
onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (loginBtn && postBtn && logoutBtn && avatar) {
        if (user) {
            loginBtn.style.display = "none";
            postBtn.style.display = "inline-block";
            logoutBtn.style.display = "inline-block";

            avatar.style.display = "flex";
            avatar.textContent = user.email?.charAt(0).toUpperCase();
        } else {
            loginBtn.style.display = "inline-block";
            postBtn.style.display = "none";
            logoutBtn.style.display = "none";

            avatar.style.display = "none";
        }
    }
});


// =======================
// LOGOUT (SAFE)
// =======================
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
    });
}


// =======================
// SCROLL TO POST (SAFE)
// =======================
if (postBtn) {
    postBtn.addEventListener("click", () => {
        const publishSection = document.getElementById("publish");
        if (publishSection) {
            publishSection.scrollIntoView({ behavior: "smooth" });
        }
    });
}


// =======================
// POST SUBMIT (FIXED - MAIN BUG FIX)
// =======================
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        console.log("Submit clicked");

        if (!currentUser) {
            alert("Please login first");
            return;
        }

        const category = document.getElementById("sub-category")?.value;
        const author = document.getElementById("sub-author")?.value;
        const title = document.getElementById("sub-title")?.value;
        const content = document.getElementById("sub-content")?.value;

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
            form.reset();

        } catch (err) {
            console.error("ERROR publishing post:", err);
            alert("Failed to publish post: " + err.message);
        }
    });
}


// =======================
// LIVE POSTS (SAFE)
// =======================
if (articlesContainer) {

    const q = query(collection(db, "posts"), orderBy("time", "desc"));

    onSnapshot(q, (snapshot) => {
        console.log("Live posts updated:", snapshot.size);

        articlesContainer.innerHTML = "";

        snapshot.forEach((doc) => {
            const data = doc.data();

            const div = document.createElement("div");
            div.className = "card";

            div.innerHTML = `
                <span class="tag">${data.category || ""}</span>
                <h4>${data.title || ""}</h4>
                <p>${data.content || ""}</p>
                <small>By ${data.author || "Unknown"} | ${data.email || ""}</small>
            `;

            articlesContainer.appendChild(div);
        });
    }, (error) => {
        console.error("Firestore error:", error);
    });
}