import { 
  Crown, 
  Gift, 
  CreditCard, 
  HelpCircle, 
  Palette, 
  Watch, 
  Cloud, 
  Moon, 
  Mic, 
  Lock, 
  ArrowRightLeft, 
  Wallet,
  ChevronRight 
} from "lucide-react";

interface SettingItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  title: string;
  section: "premium" | "general";
}

const settingsItems: SettingItem[] = [
  // Premium Section
  {
    id: "premium-features",
    icon: Crown,
    iconColor: "text-yellow-500",
    iconBg: "bg-yellow-500/10",
    title: "Premium Features",
    section: "premium",
  },
  {
    id: "referral-program",
    icon: Gift,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    title: "Referral Program",
    section: "premium",
  },
  {
    id: "manage-subscription",
    icon: CreditCard,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "Manage Subscription",
    section: "premium",
  },
  {
    id: "customer-support",
    icon: HelpCircle,
    iconColor: "text-green-500",
    iconBg: "bg-green-500/10",
    title: "Customer Support",
    section: "premium",
  },
  
  // General Section
  {
    id: "interface",
    icon: Palette,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-500/10",
    title: "Interface",
    section: "general",
  },
  {
    id: "apple-watch",
    icon: Watch,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    title: "Apple Watch",
    section: "general",
  },
  {
    id: "sync-backup",
    icon: Cloud,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    title: "Sync / Backup",
    section: "general",
  },
  {
    id: "app-theme",
    icon: Moon,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-500/10",
    title: "App Theme",
    section: "general",
  },
  {
    id: "siri-shortcuts",
    icon: Mic,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    title: "Siri Shortcuts",
    section: "general",
  },
  {
    id: "security",
    icon: Lock,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    title: "Security",
    section: "general",
  },
  {
    id: "exchange-import",
    icon: ArrowRightLeft,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-500/10",
    title: "Exchange Import",
    section: "general",
  },
  {
    id: "address-import",
    icon: Wallet,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    title: "Address Import",
    section: "general",
  },
];

export default function Settings() {
  const premiumItems = settingsItems.filter(item => item.section === "premium");
  const generalItems = settingsItems.filter(item => item.section === "general");

  const handleItemClick = (id: string) => {
    console.log("Settings item clicked:", id);
    // TODO: Navigate to specific settings page
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-4">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Premium Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Premium
          </h2>
          <div className="space-y-2">
            {premiumItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover-elevate active-elevate-2 transition-all"
                  data-testid={`setting-${item.id}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* General Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            General
          </h2>
          <div className="space-y-2">
            {generalItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover-elevate active-elevate-2 transition-all"
                  data-testid={`setting-${item.id}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            Crypto Buzz v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Data by CoinMarketCap • News by CryptoPanic
          </p>
        </div>
      </div>
    </div>
  );
}
