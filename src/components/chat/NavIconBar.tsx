import { MessageCircle, CircleDot, Megaphone, Users, Image, Settings, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "status", icon: CircleDot, label: "Status" },
  { id: "channels", icon: Megaphone, label: "Channels" },
  { id: "community", icon: Users, label: "Community" },
  { id: "media", icon: Image, label: "Media" },
];

const bottomItems = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "profile", icon: User, label: "Profile" },
];

const NavIconBar = () => {
  const [active, setActive] = useState("chat");

  return (
    <div className="flex h-full w-[60px] flex-shrink-0 flex-col items-center justify-between border-r bg-sidebar-background py-4">
      {/* Top nav items */}
      <div className="flex flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              title={item.label}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
            </button>
          );
        })}
      </div>

      {/* Bottom nav items */}
      <div className="flex flex-col items-center gap-1">
        {bottomItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              title={item.label}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.8} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavIconBar;
