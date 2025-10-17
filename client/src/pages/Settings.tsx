import { useState, useEffect } from "react";
import { Bell, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { notificationService } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are already granted
    if ("Notification" in window) {
      setNotifications(Notification.permission === "granted");
    }
  }, []);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermission();
      setNotifications(granted);
      if (granted) {
        toast({
          title: "Notifications enabled",
          description: "You'll receive alerts when price targets are hit.",
        });
      } else {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } else {
      setNotifications(false);
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSound(enabled);
    notificationService.setSoundEnabled(enabled);
  };

  const handleVibrationToggle = (enabled: boolean) => {
    setVibration(enabled);
    notificationService.setVibrationEnabled(enabled);
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleTestAlert = () => {
    if (!notifications) {
      toast({
        title: "Enable notifications first",
        description: "Turn on notifications to test the alert.",
        variant: "destructive",
      });
      return;
    }
    notificationService.testNotification();
    toast({
      title: "Test alert sent!",
      description: "Check your notifications.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Notifications */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Configure alert notifications and sounds
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="push-notifications" className="font-medium">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts when price targets are hit
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications}
                  onCheckedChange={handleNotificationToggle}
                  data-testid="switch-notifications"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {sound ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <Label htmlFor="sound" className="font-medium">
                      Alert Sound
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound when alerts trigger
                    </p>
                  </div>
                </div>
                <Switch
                  id="sound"
                  checked={sound}
                  onCheckedChange={handleSoundToggle}
                  data-testid="switch-sound"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="vibration" className="font-medium">
                      Vibration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Vibrate on mobile devices
                    </p>
                  </div>
                </div>
                <Switch
                  id="vibration"
                  checked={vibration}
                  onCheckedChange={handleVibrationToggle}
                  data-testid="switch-vibration"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme (recommended for crypto trading)
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
                data-testid="switch-dark-mode"
              />
            </div>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground">
                Crypto Buzz - Real-time Price Alerts
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Source</span>
                <span className="font-medium">CoinMarketCap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">News Source</span>
                <span className="font-medium">CryptoPanic</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleTestAlert}
                data-testid="button-test-alert"
              >
                Test Alert Sound & Notification
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
