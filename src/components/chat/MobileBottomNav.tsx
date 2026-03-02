import { MessageCircle, CircleDot, Users, Phone } from "lucide-react";
import type { NavSection } from "./NavIconBar";

interface MobileBottomNavProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  unreadCount?: number;
}

const tabs: { id: NavSection; icon: typeof MessageCircle; label: string; color: string; activeBg: string }[] = [
  { id: "streams", icon: MessageCircle, label: "Streams", color: "text-teal-500", activeBg: "bg-teal-500/15" },
  { id: "moments", icon: CircleDot, label: "Moments", color: "text-orange-500", activeBg: "bg-orange-500/15" },
  { id: "circles", icon: Users, label: "Circles", color: "text-purple-500", activeBg: "bg-purple-500/15" },
  { id: "connect", icon: Phone, label: "Connect", color: "text-blue-500", activeBg: "bg-blue-500/15" },
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
              isActive ? `${tab.activeBg} scale-105` : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Icon
                className={`h-5 w-5 transition-colors ${isActive ? tab.color : ""}`}
                strokeWidth={isActive ? 2.3 : 1.7}
              />
              {tab.id === "streams" && unreadCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? tab.color : ""}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
