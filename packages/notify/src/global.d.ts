/// <reference types="@types/alpinejs" />

export interface NotifyMagic {
  readonly isSupported: boolean;
  readonly requiresHomeScreenInstall: boolean;
  readonly permission: NotificationPermission;
  requestPermission(): Promise<NotificationPermission>;
  send(title: string, options?: NotificationOptions): Notification | null;
  sendAsync(title: string, options?: NotificationOptions): Promise<Notification | null>;
  sendIfPermitted(title: string, options?: NotificationOptions): Notification | null;
  sendIfPermittedAsync(title: string, options?: NotificationOptions): Promise<Notification | null>;
  close(notification: Notification): void;
}

declare global {
  namespace Alpine {
    interface Magics<T> {
      $notify: NotifyMagic;
    }
  }
}
