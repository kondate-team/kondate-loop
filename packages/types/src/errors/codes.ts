/**
 * Error Codes
 * @see API仕様定義書 6.0.5
 */

export const ErrorCodes = {
  // Common errors
  INVALID_REQUEST: "INVALID_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",

  // Import specific
  IMPORT_FETCH_FAILED: "IMPORT_FETCH_FAILED",
  IMPORT_PARSE_FAILED: "IMPORT_PARSE_FAILED",
  IMPORT_TIMEOUT: "IMPORT_TIMEOUT",
  IMPORT_LIMIT_EXCEEDED: "IMPORT_LIMIT_EXCEEDED",

  // Payment specific
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_METHOD_INVALID: "PAYMENT_METHOD_INVALID",
  SUBSCRIPTION_ALREADY_ACTIVE: "SUBSCRIPTION_ALREADY_ACTIVE",

  // Plan specific
  PLAN_NEXT_EMPTY: "PLAN_NEXT_EMPTY",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * HTTP Status Code mapping
 */
export const ErrorCodeToStatus: Record<ErrorCode, number> = {
  [ErrorCodes.INVALID_REQUEST]: 400,
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.FORBIDDEN]: 403,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.VALIDATION_ERROR]: 422,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.IMPORT_FETCH_FAILED]: 400,
  [ErrorCodes.IMPORT_PARSE_FAILED]: 400,
  [ErrorCodes.IMPORT_TIMEOUT]: 400,
  [ErrorCodes.IMPORT_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.PAYMENT_FAILED]: 402,
  [ErrorCodes.PAYMENT_METHOD_INVALID]: 400,
  [ErrorCodes.SUBSCRIPTION_ALREADY_ACTIVE]: 409,
  [ErrorCodes.PLAN_NEXT_EMPTY]: 409,
};

/**
 * Default error messages (Japanese)
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.INVALID_REQUEST]: "リクエストが不正です",
  [ErrorCodes.UNAUTHORIZED]: "認証が必要です",
  [ErrorCodes.FORBIDDEN]: "この操作を行う権限がありません",
  [ErrorCodes.NOT_FOUND]: "リソースが見つかりません",
  [ErrorCodes.CONFLICT]: "リソースの状態が競合しています",
  [ErrorCodes.VALIDATION_ERROR]: "入力内容に誤りがあります",
  [ErrorCodes.INTERNAL_ERROR]: "サーバーエラーが発生しました",
  [ErrorCodes.IMPORT_FETCH_FAILED]: "URLを取得できませんでした",
  [ErrorCodes.IMPORT_PARSE_FAILED]: "レシピ情報を抽出できませんでした",
  [ErrorCodes.IMPORT_TIMEOUT]: "処理がタイムアウトしました",
  [ErrorCodes.IMPORT_LIMIT_EXCEEDED]: "今月の取り込み回数上限に達しました",
  [ErrorCodes.PAYMENT_FAILED]: "決済に失敗しました",
  [ErrorCodes.PAYMENT_METHOD_INVALID]: "支払い方法が無効です",
  [ErrorCodes.SUBSCRIPTION_ALREADY_ACTIVE]: "すでに有効なサブスクリプションがあります",
  [ErrorCodes.PLAN_NEXT_EMPTY]: "「次」の献立が設定されていません",
};
