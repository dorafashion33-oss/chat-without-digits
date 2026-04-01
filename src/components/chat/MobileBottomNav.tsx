import { MessageCircle, CircleDot, Phone, Compass } from "lucide-react";
import type { NavSection } from "./NavIconBar";

interface MobileBottomNavProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  unreadCount?: number;
}

const tabs: { id: NavSection; icon: typeof MessageCircle; label: string; activeColor: string }[] = [
  { id: "streams", icon: MessageCircle, label: "Streams", activeColor: "from-blue-500 to-purple-500" },
  { id: "moments", icon: CircleDot, label: "Moments", activeColor: "from-orange-500 to-pink-500" },
  { id: "connect", icon: Phone, label: "Connect", activeColor: "from-green-500 to-teal-500" },
  { id: "discover", icon: Compass, label: "Discover", activeColor: "from-purple-500 to-indigo-500" },
];

const MobileBottomNav = ({ active, onNavigate, unreadCount = 0 }: MobileBottomNavProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-all duration-200"
            >
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                isActive ? `bg-gradient-to-r ${tab.activeColor} text-white shadow-md scale-110` : "text-muted-foreground"
              }`}>
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={isActive ? 2.5 : 1.7}
                  fill={isActive ? "currentColor" : "none"}
                />
                {tab.id === "streams" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
