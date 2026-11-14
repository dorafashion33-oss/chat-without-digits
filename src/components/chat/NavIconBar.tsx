import { MessageCircle, CircleDot, Phone, Settings, User, Compass, Sparkles } from "lucide-react";
import buzzLogo from "@/assets/buzz-logo.jpeg";
import InstallAppDialog from "./InstallAppDialog";

export type NavSection = "streams" | "moments" | "connect" | "discover" | "settings" | "profile";

const navItems: { id: NavSection; icon: typeof MessageCircle; label: string }[] = [
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
    <div className="flex h-full w-[56px] md:w-[68px] flex-shrink-0 flex-col items-center justify-between border-r-2 border-[#0a0a0a] bg-[#fffbec] py-4">
      <div className="flex flex-col items-center gap-5">
        {/* Brand Logo with Tactile Border */}
        <div className="relative">
          <img
            src={buzzLogo}
            alt="Buzz"
            className="h-9 w-9 md:h-10 md:w-10 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a]"
          />
          <span className="absolute -bottom-1 -right-1 text-[11px] leading-none" title="Made in India">
            🇮🇳
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col items-center gap-2">
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
                      ? "border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a]"
                      : "text-[#0a0a0a]/70 hover:bg-white hover:border-2 hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:shadow-[0_2px_0_0_#0a0a0a]"
                  }`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.4 : 1.8}
                    fill={isActive ? "currentColor" : "none"}
                  />
                </button>
                <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg border-2 border-[#0a0a0a] bg-white px-2.5 py-1 text-xs font-bold text-[#0a0a0a] opacity-0 shadow-[0_2px_0_0_#0a0a0a] transition-opacity duration-150 group-hover:opacity-100 hidden md:block whitespace-nowrap">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Icons (Settings & Profile) */}
      <div className="flex flex-col items-center gap-2">
        {/* Reopen What's New Feature Spotlight */}
        <div className="relative group">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("buzz:open-spotlight"))}
            aria-label="What's New in Buzz"
            className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:scale-105 transition-all"
            title="What's New (Guest Chat)"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        {bottomItems.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onNavigate(item.id)}
                aria-label={item.label}
                className={`relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_3px_0_0_#0a0a0a]"
                    : "text-[#0a0a0a]/70 hover:bg-white hover:border-2 hover:border-[#0a0a0a] hover:text-[#0a0a0a] hover:shadow-[0_2px_0_0_#0a0a0a]"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.4 : 1.8} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavIconBar;
