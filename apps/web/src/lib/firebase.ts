/**
 * Firebase configuration
 * @see 外部連携詳細仕様書 3.3
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Firebase設定が有効かどうか
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Firebaseアプリインスタンス（遅延初期化）
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Firebaseアプリを取得（未初期化なら初期化）
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;

  if (!app) {
    const existingApps = getApps();
    app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  }

  return app;
}

/**
 * Firebase Messagingを取得
 */
export function getFirebaseMessaging(): Messaging | null {
  if (!isFirebaseConfigured) return null;

  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;

  if (!messaging) {
    messaging = getMessaging(firebaseApp);
  }

  return messaging;
}

// VAPID Key（Web Push用公開鍵）
export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";
