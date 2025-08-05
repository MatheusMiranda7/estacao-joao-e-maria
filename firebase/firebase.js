// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1BG-i0BeDbtry8Ew6kY5tJuedYotNbk0",
  authDomain: "estacaojoaoemaria.firebaseapp.com",
  databaseURL: "https://estacaojoaoemaria-default-rtdb.firebaseio.com",
  projectId: "estacaojoaoemaria",
  storageBucket: "estacaojoaoemaria.firebasestorage.app",
  messagingSenderId: "1096833088120",
  appId: "1:1096833088120:web:4f95d9cd9053185ac34b8d",
  measurementId: "G-ZNP8KZ2PXC"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, push, set, onValue };
