// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDD2iqjSQaoAU94ijUT4xzuzLoUVrKZTtE",
  authDomain: "workspace-saas-8873f.firebaseapp.com",
  projectId: "workspace-saas-8873f",
  storageBucket: "workspace-saas-8873f.firebasestorage.app",
  messagingSenderId: "917585289400",
  appId: "1:917585289400:web:fbe74cd0f0c4c6cf2d944d",
  measurementId: "G-MHRD96LZ9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging=getMessaging(app);
export const vapidKey ="BHO_ALDjSLQkhUg8jZJ_yXwCmCqoBXs_hr53oSu2p2tLkE328e1MRHK3i952m4_IQtb4l-9u7uBvIo6RzI8_Vk0";