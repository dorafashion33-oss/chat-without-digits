import { MessageCircle, CircleDot, Phone, Compass, Settings, User } from "lucide-react";
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
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "profile", icon: User, label: "Profile" },
];

const MobileBottomNav = ({ active, onNavigate, unreadCount = 0 }: MobileBottomNavProps) => {
   return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[#0a0a0a] bg-[#fffbec] lg:hidden safe-area-bottom shadow-lg">
      {/* 🇮🇳 Mobile Bottom Nav Tiranga Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] animate-pulse" />
      <div className="flex items-center justify-around px-1 py-1.5">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-0.5 transition-all"
            >
              <div
                className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] scale-105"
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
                className={`text-[9px] font-bold tracking-tight ${
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
