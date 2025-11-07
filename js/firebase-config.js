// Import fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Input Nilai Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr8J75kII01AdnU6pzruIg9P9TKvCTGmU",
  authDomain: "portal-inputnilai-mahasiswa.firebaseapp.com",
  projectId: "portal-inputnilai-mahasiswa",
  storageBucket: "portal-inputnilai-mahasiswa.firebasestorage.app",
  messagingSenderId: "610820618129",
  appId: "1:610820618129:web:1b075d741c839aace30c30"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Autentikasi anonim
signInAnonymously(auth).catch((error) => {
    console.error("Autentikasi anonim gagal:", error);
});

// Ekspor instance db dan auth untuk digunakan di modul lain
export { db, auth };