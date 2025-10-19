import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertManagerProvider } from "@/lib/alertManager";
import { WebSocketProvider } from "@/lib/WebSocketProvider";
import { BottomNav } from "@/components/BottomNav";
import AllCryptos from "@/pages/AllCryptos";
import Portfolios from "@/pages/Portfolios";
import Coin from "@/pages/Coin";
import Alerts from "@/pages/Alerts";
import News from "@/pages/News";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="pb-16 md:pb-0">
      <Switch>
        <Route path="/" component={AllCryptos} />
        <Route path="/portfolios" component={Portfolios} />
        <Route path="/coin/:symbol" component={Coin} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/news" component={News} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AlertManagerProvider>
          <WebSocketProvider>
            <Toaster />
            <Router />
          </WebSocketProvider>
        </AlertManagerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
