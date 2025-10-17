// Browser notification service for crypto alerts

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = "default";
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;

  private constructor() {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === "granted";
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  setVibrationEnabled(enabled: boolean) {
    this.vibrationEnabled = enabled;
  }

  async showAlertNotification(data: {
    symbol: string;
    price: number;
    alertType: string;
    title?: string;
  }) {
    if (this.permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    const title = data.title || `${data.symbol} Price Alert!`;
    const body = `${data.symbol} hit $${data.price.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;

    try {
      const notification = new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: `alert-${data.symbol}-${Date.now()}`,
        requireInteraction: true,
        data: {
          symbol: data.symbol,
          price: data.price,
          alertType: data.alertType,
        },
      });

      // Play sound
      if (this.soundEnabled) {
        this.playAlertSound();
      }

      // Vibrate
      if (this.vibrationEnabled && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }

      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navigate to coin page
        window.location.href = `/coin/${data.symbol}`;
      };

      return notification;
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  private playAlertSound() {
    try {
      // Use a simple beep sound or load from a file
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Hz
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  }

  testNotification() {
    this.showAlertNotification({
      symbol: "BTC",
      price: 100000,
      alertType: "price",
      title: "Test Alert",
    });
  }
}

export const notificationService = NotificationService.getInstance();
