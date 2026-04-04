import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile, Search, Sticker } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";

const EMOJI_CATEGORIES: Record<string, string[]> = {
  "😀 Smileys": ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","🥰","😍","😘","😗","😙","😚","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","🥱","😴","😌","😛","😜","🤪"],
  "❤️ Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟"],
  "👋 Hands": ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🙏"],
  "🎉 Objects": ["🎉","🎊","🔥","⭐","💫","✨","🎯","💡","📎","📁","🔗","💻","📱","⏰","🎵","🎶","🏆","🎮","🎲","🧩","🚀","💰","🎁","📌","📝","✅","❌","⚡"],
};

const STICKER_PACKS: Record<string, string[]> = {
  "😊 Cute": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🦄","🦋","🐛","🐝"],
  "🍔 Food": ["🍔","🍕","🍟","🌭","🍿","🧂","🥚","🍳","🧇","🥞","🧈","🍞","🥐","🥨","🧀","🥗","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🍦","🍰","🧁","🍩","🍪"],
  "⚽ Sports": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🥊","🥋","⛳","🏄","🏊","🚴","🧗","🤸","🤺","🏋️","🤼","🤾","⛷️","🏂"],
  "🌍 Travel": ["🌍","🌎","🌏","🗺️","🧭","🏔️","⛰️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🏞️","🏟️","🏛️","🏗️","🏘️","🏙️","🏚️","🏠","✈️","🚀","🛸","🚁","🛶","⛵","🚢"],
};

interface GifResult {
  id: string;
  url: string;
  preview: string;
}

type TabType = "emoji" | "gif" | "stickers";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onGifSelect?: (gifUrl: string) => void;
}

const EmojiPicker = ({ onSelect, onGifSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabType>("emoji");
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [activeStickerPack, setActiveStickerPack] = useState(Object.keys(STICKER_PACKS)[0]);
  const [gifSearch, setGifSearch] = useState("");
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    setOpen(false);
  };

  const handleStickerSelect = (sticker: string) => {
    onSelect(sticker);
    setOpen(false);
  };

  const searchGifs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setGifs([]);
      return;
    }
    setGifLoading(true);
    try {
      // Using Tenor v2 API with a public key for GIF search
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&client_key=buzz_chat&limit=20&media_filter=gif,tinygif`
      );
      const data = await res.json();
      const results: GifResult[] = (data.results || []).map((r: any) => ({
        id: r.id,
        url: r.media_formats?.gif?.url || r.media_formats?.tinygif?.url || "",
        preview: r.media_formats?.tinygif?.url || r.media_formats?.gif?.url || "",
      }));
      setGifs(results);
    } catch {
      setGifs([]);
    }
    setGifLoading(false);
  }, []);

  const handleGifSearchChange = (val: string) => {
    setGifSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchGifs(val), 400);
  };

  const handleGifClick = (gif: GifResult) => {
    if (onGifSelect) {
      onGifSelect(gif.url);
    } else {
      onSelect(`[gif]${gif.url}[/gif]`);
    }
    setOpen(false);
  };

  // Load trending GIFs when tab opens
  useEffect(() => {
    if (tab === "gif" && gifs.length === 0 && !gifSearch) {
      searchGifs("trending");
    }
  }, [tab, gifs.length, gifSearch, searchGifs]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="rounded-full p-2 transition-colors hover:bg-accent">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 p-0 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button onClick={() => setTab("emoji")} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === "emoji" ? "text-primary border-b-2 border-primary bg-accent/30" : "text-muted-foreground hover:text-foreground"}`}>
            😀 Emoji
          </button>
          <button onClick={() => setTab("gif")} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === "gif" ? "text-primary border-b-2 border-primary bg-accent/30" : "text-muted-foreground hover:text-foreground"}`}>
            GIF
          </button>
          <button onClick={() => setTab("stickers")} className={`flex-1 py-2.5 text-xs font-medium transition-colors ${tab === "stickers" ? "text-primary border-b-2 border-primary bg-accent/30" : "text-muted-foreground hover:text-foreground"}`}>
            😊 Stickers
          </button>
        </div>

        {tab === "emoji" && (
          <div className="p-2">
            <div className="flex gap-1 border-b border-border pb-2 mb-2 overflow-x-auto scrollbar-thin">
              {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-md px-2 py-1 text-xs transition-colors ${activeCategory === cat ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto scrollbar-thin">
              {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
                <button key={emoji} onClick={() => handleSelect(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-lg hover:bg-accent transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "gif" && (
          <div className="p-2">
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={gifSearch}
                onChange={(e) => handleGifSearchChange(e.target.value)}
                placeholder="Search GIFs..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <div className="max-h-52 overflow-y-auto scrollbar-thin">
              {gifLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : gifs.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {gifs.map((gif) => (
                    <button key={gif.id} onClick={() => handleGifClick(gif)} className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                      <img src={gif.preview} alt="GIF" className="w-full h-24 object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground py-8">Search for GIFs above ☝️</p>
              )}
            </div>
          </div>
        )}

        {tab === "stickers" && (
          <div className="p-2">
            <div className="flex gap-1 border-b border-border pb-2 mb-2 overflow-x-auto scrollbar-thin">
              {Object.keys(STICKER_PACKS).map((pack) => (
                <button key={pack} onClick={() => setActiveStickerPack(pack)}
                  className={`shrink-0 rounded-md px-2 py-1 text-xs transition-colors ${activeStickerPack === pack ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"}`}>
                  {pack}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 max-h-48 overflow-y-auto scrollbar-thin">
              {STICKER_PACKS[activeStickerPack].map((sticker) => (
                <button key={sticker} onClick={() => handleStickerSelect(sticker)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl hover:bg-accent transition-colors hover:scale-110">
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
