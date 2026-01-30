/**
 * Stripe Card Input Component
 * @see 外部連携詳細仕様書 2.4
 */

import * as React from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeCardElement, StripeCardElementChangeEvent } from "@stripe/stripe-js";
import { stripePromise, isStripeConfigured } from "@/lib/stripe";
import { Button } from "@/components/ui/button";

// CardElementのスタイル設定
const cardElementOptions = {
  style: {
    base: {
      fontSize: "14px",
      color: "#1a1a1a",
      fontFamily: "system-ui, sans-serif",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: true, // 日本では郵便番号不要
};

type CardInputFormProps = {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  submitLabel?: string;
  disabled?: boolean;
};

/**
 * カード入力フォーム（Elements内部で使用）
 */
function CardInputForm({
  onSuccess,
  onError,
  submitLabel = "カードを登録",
  disabled = false,
}: CardInputFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = React.useState(false);
  const [cardComplete, setCardComplete] = React.useState(false);
  const [cardError, setCardError] = React.useState<string | null>(null);

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setCardComplete(event.complete);
    setCardError(event.error?.message ?? null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError("Stripeが初期化されていません");
      return;
    }

    const cardElement = elements.getElement(CardElement) as StripeCardElement | null;
    if (!cardElement) {
      onError("カード入力が見つかりません");
      return;
    }

    setIsLoading(true);

    try {
      // PaymentMethodを作成（トークン化）
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        onError(error.message ?? "カード情報の処理に失敗しました");
        return;
      }

      if (paymentMethod) {
        onSuccess(paymentMethod.id);
      }
    } catch {
      onError("カード情報の処理中にエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <CardElement options={cardElementOptions} onChange={handleCardChange} />
      </div>
      {cardError && (
        <p className="text-xs text-destructive">{cardError}</p>
      )}
      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={!stripe || !cardComplete || isLoading || disabled}
      >
        {isLoading ? "処理中..." : submitLabel}
      </Button>
    </form>
  );
}

type StripeCardInputProps = {
  onSuccess: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  submitLabel?: string;
  disabled?: boolean;
};

/**
 * Stripeカード入力コンポーネント
 *
 * @example
 * ```tsx
 * <StripeCardInput
 *   onSuccess={(pmId) => {
 *     // POST /v1/payment-methods { paymentMethodId: pmId }
 *   }}
 *   onError={(error) => {
 *     toast.error(error);
 *   }}
 * />
 * ```
 */
export function StripeCardInput(props: StripeCardInputProps) {
  // Stripeが設定されていない場合のフォールバック
  if (!isStripeConfigured || !stripePromise) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Stripe公開鍵が設定されていません
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            環境変数 VITE_STRIPE_PUBLISHABLE_KEY を設定してください
          </p>
        </div>
        <Button className="w-full rounded-full" disabled>
          {props.submitLabel ?? "カードを登録"}
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CardInputForm {...props} />
    </Elements>
  );
}

export default StripeCardInput;
