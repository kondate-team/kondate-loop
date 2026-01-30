/**
 * Push Notification utilities
 * @see 外部連携詳細仕様書 3.4
 */

import { getToken } from "firebase/messaging";
import { getFirebaseMessaging, vapidKey, isFirebaseConfigured } from "./firebase";

const PUSH_TOKEN_KEY = "kondate-push-token";

/**
 * プッシュ通知がサポートされているかチェック
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

/**
 * Service Workerを登録
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );
  await navigator.serviceWorker.ready;
  return registration;
}

/**
 * FCMトークンを取得
 * @returns FCMトークン（取得失敗時はnull）
 */
export async function requestPushToken(): Promise<string | null> {
  if (!isPushSupported()) {
    console.warn("[push] Push notifications not supported");
    return null;
  }

  // 通知許可をリクエスト
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("[push] Notification permission denied");
    return null;
  }

  // Firebaseが設定されていない場合はフォールバック
  if (!isFirebaseConfigured) {
    console.warn("[push] Firebase not configured, using fallback token");
    // Service Workerは登録しておく（将来のため）
    await registerServiceWorker();
    // フォールバック: ダミートークン
    const fallbackToken = `fallback-${Date.now()}`;
    localStorage.setItem(PUSH_TOKEN_KEY, fallbackToken);
    return fallbackToken;
  }

  try {
    // Service Worker登録
    const registration = await registerServiceWorker();

    // Firebase Messaging取得
    const messaging = getFirebaseMessaging();
    if (!messaging) {
      throw new Error("Firebase Messaging not available");
    }

    // FCMトークン取得
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      localStorage.setItem(PUSH_TOKEN_KEY, token);
      console.log("[push] FCM token obtained");
      return token;
    }

    console.warn("[push] Failed to get FCM token");
    return null;
  } catch (error) {
    console.error("[push] Error getting FCM token:", error);
    return null;
  }
}

/**
 * 保存されているトークンを取得
 */
export function getStoredPushToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PUSH_TOKEN_KEY);
}

/**
 * トークンを削除（プッシュ通知OFF時）
 */
export function clearPushToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PUSH_TOKEN_KEY);
}

/**
 * トークンがFCMトークンか（フォールバックではないか）
 */
export function isFcmToken(token: string | null): boolean {
  if (!token) return false;
  return !token.startsWith("fallback-");
}
