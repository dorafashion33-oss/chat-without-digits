import { MessageCircle, CircleDot, Phone, Compass } from "lucide-react";
import type { NavSection } from "./NavIconBar";

interface MobileBottomNavProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  unreadCount?: number;
}

const tabs: { id: NavSection; icon: typeof MessageCircle; label: string }[] = [
  { id: "streams", icon: MessageCircle, label: "Streams" },
  { id: "moments", icon: CircleDot, label: "Moments" },
  { id: "connect", icon: Phone, label: "Connect" },
  { id: "discover", icon: Compass, label: "Discover" },
];

const MobileBottomNav = ({ active, onNavigate, unreadCount = 0 }: MobileBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-md px-2 py-1.5 lg:hidden animate-slide-up">
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 transition-all duration-200 ${
              isActive ? "scale-105" : "text-muted-foreground"
            }`}
          >
            <div className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
              isActive ? "gradient-brand text-white shadow-sm" : ""
            }`}>
              <Icon
                className={`h-[18px] w-[18px] transition-colors`}
                strokeWidth={isActive ? 2.3 : 1.7}
                fill={isActive ? "currentColor" : "none"}
              />
              {tab.id === "streams" && unreadCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-primary" : ""}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
