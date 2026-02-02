/**
 * Stripe configuration
 * @see 外部連携詳細仕様書 2.4
 */

import { loadStripe } from "@stripe/stripe-js";

// Stripe公開鍵（環境変数から取得）
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

// Stripeインスタンス（遅延ロード）
export const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

// 開発環境用のダミー公開鍵（テスト用）
export const isStripeConfigured = !!STRIPE_PUBLISHABLE_KEY;
