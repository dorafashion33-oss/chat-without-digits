import { useState } from "react";
import { FileText, Download, FileIcon, BarChart2, Check } from "lucide-react";

const MessageContent = ({ text }: { text: string }) => {
  // ─── Real In-Chat Interactive Polls ───
  const pollMatch = text.match(/^\[poll:(.*?)\](.*?)\|(.*?)\|(.*?)\[\/poll\]$/);
  if (pollMatch) {
    const [, pollId, question, optionsRaw, votesRaw] = pollMatch;
    const options = optionsRaw.split(",");
    let votesMap: Record<number, number> = {};
    try {
      votesMap = JSON.parse(votesRaw || "{}");
    } catch {}

    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const totalVotes = Object.values(votesMap).reduce((a, b) => a + b, 0) + (selectedOpt !== null ? 1 : 0);

    return (
      <div className="bz-card p-3.5 max-w-[280px] bg-white shadow-[0_2px_0_0_#0a0a0a]">
        <div className="flex items-center gap-1.5 mb-2 font-black text-xs text-[#0a0a0a]">
          <BarChart2 className="h-4 w-4 text-[#0a0a0a]" /> {question}
        </div>
        <div className="space-y-2">
          {options.map((opt, idx) => {
            const count = (votesMap[idx] || 0) + (selectedOpt === idx ? 1 : 0);
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOpt(idx)}
                className={`relative w-full rounded-lg border-2 border-[#0a0a0a] p-2 text-left text-xs font-bold overflow-hidden transition-all ${
                  selectedOpt === idx ? "bg-[#FFF6B8]" : "bg-white hover:bg-[#fffbec]"
                }`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[#FCE314]/40 z-0 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {selectedOpt === idx && <Check className="h-3 w-3 stroke-[3]" />}
                    {opt}
                  </span>
                  <span className="font-mono text-[10px] text-[#5b5b55]">{pct}% ({count})</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] font-mono text-[#5b5b55] font-bold text-right">
          {totalVotes} total vote{totalVotes === 1 ? "" : "s"}
        </p>
      </div>
    );
  }

  // GIF
  const gifMatch = text.match(/^\[gif\](.*?)\[\/gif\]$/);
  if (gifMatch) {
    return <img src={gifMatch[1]} alt="GIF" className="max-w-full rounded-xl max-h-52 object-cover border-2 border-[#0a0a0a]" />;
  }

  // Image
  const imgMatch = text.match(/^\[img\](.*?)\[\/img\]([\s\S]*)$/);
  if (imgMatch) {
    return (
      <div>
        <img
          src={imgMatch[1]}
          alt="shared"
          loading="lazy"
          className="max-w-full rounded-xl max-h-60 object-cover cursor-pointer border-2 border-[#0a0a0a]"
          onClick={() => window.open(imgMatch[1], "_blank", "noopener,noreferrer")}
        />
        {imgMatch[2]?.trim() && (
          <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap break-words mt-1">{imgMatch[2].trim()}</p>
        )}
      </div>
    );
  }

  // Video
  const videoMatch = text.match(/^\[video\](.*?)\[\/video\]([\s\S]*)$/);
  if (videoMatch) {
    return (
      <div>
        <video src={videoMatch[1]} controls preload="metadata" className="max-w-full rounded-xl max-h-60 border-2 border-[#0a0a0a]" />
        {videoMatch[2]?.trim() && (
          <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap break-words mt-1">{videoMatch[2].trim()}</p>
        )}
      </div>
    );
  }

  // Files
  const fileMatch = text.match(/^\[file:(.*?)\](.*?)\[\/file\]([\s\S]*)$/);
  if (fileMatch) {
    const name = fileMatch[1];
    const url = fileMatch[2];
    const caption = fileMatch[3];
    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-white p-2 min-w-[200px]">
          <FileText className="h-5 w-5 text-[#0a0a0a]" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#0a0a0a] truncate">{name}</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" download={name} className="p-1 hover:bg-[#FFF6B8] rounded">
            <Download className="h-4 w-4" />
          </a>
        </div>
        {caption?.trim() && <p className="text-xs font-semibold">{caption.trim()}</p>}
      </div>
    );
  }

  return <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap break-words">{text}</p>;
};

export default MessageContent;
