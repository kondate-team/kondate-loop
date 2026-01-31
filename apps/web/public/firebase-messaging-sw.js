/**
 * Firebase Cloud Messaging Service Worker
 * @see 外部連携詳細仕様書 3.4
 *
 * 注意: このファイルはViteでバンドルされないため、
 * 環境変数はビルド時に直接埋め込むか、ハードコードする必要があります。
 * Firebase設定後に値を更新してください。
 */

/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Firebase設定（Firebase Console から取得した値に置き換えてください）
// TODO: 環境変数から自動生成するビルドスクリプトを追加予定
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// 設定が有効な場合のみ初期化
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  // バックグラウンドメッセージの処理
  messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Background message received:", payload);

    const notificationTitle = payload.notification?.title || "こんだてLoop";
    const notificationOptions = {
      body: payload.notification?.body || "新しい通知が届きました",
      icon: payload.notification?.icon || "/brand/kondate-icon-192.png",
      badge: "/brand/kondate-icon-96.png",
      data: {
        url: payload.data?.link || payload.fcmOptions?.link || "/",
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// 通知クリック時の処理
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 既存のウィンドウがあればフォーカス
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // なければ新規ウィンドウ
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
