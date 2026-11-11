import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GuestChat from "./pages/GuestChat";
import GuestInbox from "./pages/GuestInbox";
import AuthPage from "./pages/AuthPage";
import MotionFX from "./components/MotionFX";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <MotionFX />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Index />} />
            <Route path="/privacy" element={<Index />} />
            <Route path="/buzz-web" element={<Index />} />
            <Route path="/download" element={<Index />} />
            <Route path="/contact" element={<Index />} />
            <Route path="/c/:username" element={<GuestChat />} />
            <Route path="/auth" element={<AuthPage onAuth={() => (window.location.href = "/")} />} />
            <Route path="/guests" element={<GuestInbox />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
