import { MessageCircle, CircleDot, Megaphone, Users, Image, Settings, User } from "lucide-react";

export type NavSection = "chat" | "status" | "channels" | "community" | "media" | "settings" | "profile";

const navItems: { id: NavSection; icon: typeof MessageCircle; label: string }[] = [
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "status", icon: CircleDot, label: "Status" },
  { id: "channels", icon: Megaphone, label: "Channels" },
  { id: "community", icon: Users, label: "Community" },
  { id: "media", icon: Image, label: "Media" },
];

const bottomItems: { id: NavSection; icon: typeof Settings; label: string }[] = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "profile", icon: User, label: "Profile" },
];

interface NavIconBarProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
}

const NavIconBar = ({ active, onNavigate }: NavIconBarProps) => {
  return (
    <div className="hidden md:flex h-full w-[64px] flex-shrink-0 flex-col items-center justify-between border-r border-border bg-sidebar-background py-5">
      {/* Logo / brand mark */}
      <div className="flex flex-col items-center gap-4">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          B
        </div>

        {/* Top nav items */}
        <div className="flex flex-col items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-[-6px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.2 : 1.7} />
                </button>
                {/* Tooltip */}
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav items */}
      <div className="flex flex-col items-center gap-0.5">
        {bottomItems.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {isActive && (
                  <div className="absolute left-[-6px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                )}
                <Icon className="h-[20px] w-[20px]" strokeWidth={isActive ? 2.2 : 1.7} />
              </button>
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
              </div>
            </div>
          );
        })}

        {/* Profile avatar */}
        <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold ring-2 ring-primary/30">
          Y
        </div>
      </div>
    </div>
  );
};

export default NavIconBar;
