// Import fungsi Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Configurasi Firebase Nilai Mahasiswa Kami
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

// Autentikasi anonim sederhana (diperlukan untuk aturan keamanan default)
signInAnonymously(auth).catch((error) => {
    console.error("Autentikasi anonim gagal:", error);
    // Tampilkan pesan error
});

// Tentukan koleksi database di Firestore
const nilaiCollectionRef = collection(db, "nilaiMahasiswa");

/**
 * Fungsi untuk menyimpan data
 * @param {object} data - Objek data (nama, nim, mataKuliah, nilai)
 */
export async function simpanDataKeFirestore(data) {
    try {
        // Fungsi addDoc akan menyimpan data ke koleksi
        await addDoc(nilaiCollectionRef, data);
    } catch (e) {
        console.error("Error adding document: ", e);
        // Lemparkan error agar bisa ditangkap oleh logic.js
        throw new Error("Gagal menyimpan data ke database."); 
    }
}

/**
 * Fungsi untuk mengambil data
 * @returns {Array} - Array berisi data mahasiswa
 */
export async function loadDataDariFirestore() {
    try {
        const querySnapshot = await getDocs(nilaiCollectionRef);
        const data = [];
        // Loop setiap dokumen yang ditemukan
        querySnapshot.forEach((doc) => {
            data.push(doc.data());
        });
        return data; // Kembalikan array berisi data
    } catch (e) {
        console.error("Error getting documents: ", e);
        // Lemparkan error agar bisa ditangkap oleh logic.js
        throw new Error("Gagak memuat data dari database."); 
    }
}