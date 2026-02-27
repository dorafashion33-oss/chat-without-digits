import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { useState } from "react";

const EMOJI_CATEGORIES: Record<string, string[]> = {
  "😀 Smileys": ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","🥰","😍","😘","😗","😙","😚","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","🥱","😴","😌","😛","😜","🤪"],
  "❤️ Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟"],
  "👋 Hands": ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🙏"],
  "🎉 Objects": ["🎉","🎊","🔥","⭐","💫","✨","🎯","💡","📎","📁","🔗","💻","📱","⏰","🎵","🎶","🏆","🎮","🎲","🧩","🚀","💰","🎁","📌","📝","✅","❌","⚡"],
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ onSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="rounded-full p-2 transition-colors hover:bg-accent">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 p-2">
        {/* Category tabs */}
        <div className="flex gap-1 border-b border-border pb-2 mb-2 overflow-x-auto scrollbar-thin">
          {Object.keys(EMOJI_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-md px-2 py-1 text-xs transition-colors ${
                activeCategory === cat ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Emoji grid */}
        <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto scrollbar-thin">
          {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelect(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
