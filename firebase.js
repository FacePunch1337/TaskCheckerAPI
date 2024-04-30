
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCnlcR-1pnqtuGD2WcAuTIk0EKbvFLpzro",
  authDomain: "taskcheker-39fd8.firebaseapp.com",
  databaseURL: "https://taskcheker-39fd8-default-rtdb.firebaseio.com",
  projectId: "taskcheker-39fd8",
  storageBucket: "taskcheker-39fd8.appspot.com",
  messagingSenderId: "842129711807",
  appId: "1:842129711807:web:2092c0d8bd462432b01c0a",
  measurementId: "G-88K82CEL5B"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
export const storage = firebase.storage(app);