import { MessageCircle, CircleDot, Phone, Settings, User, Compass } from "lucide-react";
import buzzLogo from "@/assets/buzz-logo.jpeg";

export type NavSection = "streams" | "moments" | "connect" | "discover" | "settings" | "profile";

const navItems: { id: NavSection; icon: typeof MessageCircle; filledIcon?: typeof MessageCircle; label: string }[] = [
  { id: "streams", icon: MessageCircle, label: "Streams" },
  { id: "moments", icon: CircleDot, label: "Moments" },
  { id: "connect", icon: Phone, label: "Connect" },
  { id: "discover", icon: Compass, label: "Discover" },
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
    <div className="flex h-full w-[52px] md:w-[64px] flex-shrink-0 flex-col items-center justify-between border-r border-border bg-sidebar-background py-3 md:py-5">
      <div className="flex flex-col items-center gap-4">
        <img src={buzzLogo} alt="Buzz" className="h-8 w-8 md:h-9 md:w-9 rounded-xl object-cover shadow-md" />
        <div className="flex flex-col items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  className={`relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? "gradient-brand text-white shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon
                    className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]"
                    strokeWidth={isActive ? 2.2 : 1.7}
                    fill={isActive ? "currentColor" : "none"}
                  />
                </button>
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 hidden md:block">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        {bottomItems.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
                className={`relative flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "gradient-brand text-white shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon
                  className="h-[18px] w-[18px] md:h-[20px] md:w-[20px]"
                  strokeWidth={isActive ? 2.2 : 1.7}
                  fill={isActive ? "currentColor" : "none"}
                />
              </button>
              <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 hidden md:block">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavIconBar;
