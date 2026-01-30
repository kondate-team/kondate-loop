/**
 * Notification Models
 * @see API仕様定義書 6.2.55-6.2.60
 */

export type NotificationType = "news" | "personal";
export type NotificationPlatform = "web";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string; // ISO8601
};

export type NotificationList = {
  items: Notification[];
  unreadCount: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export type NotificationReadInput = {
  notificationIds?: string[];
  all?: boolean;
};

export type NotificationReadResult = {
  readCount: number;
  unreadCount: number;
};

export type PushToken = {
  token: string;
  platform: NotificationPlatform;
};

export type PushTokenCreateInput = {
  token: string;
  platform: NotificationPlatform;
};

export type NotificationSettings = {
  pushEnabled: boolean;
  categories: {
    news: boolean;
    personal: boolean;
  };
};

export type NotificationSettingsUpdateInput = Partial<NotificationSettings>;
