/**
 * Notification Gateway helper for formatting realtime notification events (`notification:new`).
 */
export class NotificationGateway {
  formatEventPayload(notification: Record<string, unknown>) {
    return {
      event: 'notification:new',
      timestamp: new Date().toISOString(),
      notification,
    };
  }
}

export const notificationGateway = new NotificationGateway();
