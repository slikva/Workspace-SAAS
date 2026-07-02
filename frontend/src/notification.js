import { getToken } from "firebase/messaging";
import { messaging, vapidKey } from "./firebase";

export async function requestNotificationPermission() {

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return null;
  }
const token = await getToken(messaging, {
  vapidKey,
});

console.log("FCM Token:", token);

const currentUser = JSON.parse(localStorage.getItem("user"));

if (currentUser?.user_id && token) {

  await fetch(`${import.meta.env.VITE_API_URL}/save-fcm-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: currentUser.user_id,
      token,
    }),
  });

}

return token;
}