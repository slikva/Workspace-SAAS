importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDD2iqjSQaoAU94ijUT4xzuzLoUVrKZTtE",
  authDomain: "workspace-saas-8873f.firebaseapp.com",
  projectId: "workspace-saas-8873f",
  storageBucket: "workspace-saas-8873f.firebasestorage.app",
  messagingSenderId: "917585289400",
  appId: "1:917585289400:web:fbe74cd0f0c4c6cf2d944d",
  measurementId: "G-MHRD96LZ9F"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});