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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#0a0a0a] bg-[#fffbec] lg:hidden safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-all"
            >
              <div
                className={`relative flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]"
                    : "border-transparent text-[#0a0a0a]/60 hover:text-[#0a0a0a]"
                }`}
              >
                <Icon
                  className="h-4 w-4"
                  strokeWidth={isActive ? 2.5 : 1.8}
                  fill={isActive ? "currentColor" : "none"}
                />
                {tab.id === "streams" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-[#0a0a0a] bg-red-500 px-1 text-[9px] font-black text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold tracking-tight ${
                  isActive ? "text-[#0a0a0a]" : "text-[#0a0a0a]/60"
                }`}
              >
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
