import { FileText, Download, FileIcon } from "lucide-react";

/** Renders inline images, videos, GIFs, PDFs, files, or plain text */
const MessageContent = ({ text }: { text: string }) => {
  const gifMatch = text.match(/^\[gif\](.*?)\[\/gif\]$/);
  if (gifMatch) {
    return <img src={gifMatch[1]} alt="GIF" className="max-w-full rounded-xl max-h-52 object-cover" />;
  }

  const imgMatch = text.match(/^\[img\](.*?)\[\/img\]([\s\S]*)$/);
  if (imgMatch) {
    return (
      <div>
        <img
          src={imgMatch[1]}
          alt="shared"
          loading="lazy"
          className="max-w-full rounded-xl max-h-60 object-cover cursor-pointer"
          onClick={() => window.open(imgMatch[1], "_blank", "noopener,noreferrer")}
        />
        {imgMatch[2]?.trim() && (
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words mt-1">{imgMatch[2].trim()}</p>
        )}
      </div>
    );
  }

  const videoMatch = text.match(/^\[video\](.*?)\[\/video\]([\s\S]*)$/);
  if (videoMatch) {
    return (
      <div>
        <video src={videoMatch[1]} controls preload="metadata" className="max-w-full rounded-xl max-h-60" />
        {videoMatch[2]?.trim() && (
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words mt-1">{videoMatch[2].trim()}</p>
        )}
      </div>
    );
  }

  const fileMatch = text.match(/^\[file:(.*?)\](.*?)\[\/file\]([\s\S]*)$/);
  if (fileMatch) {
    const name = fileMatch[1];
    const url = fileMatch[2];
    const caption = fileMatch[3];
    const isPdf = /\.pdf($|\?)/i.test(name) || /\.pdf($|\?)/i.test(url);
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-xl bg-accent/60 p-2 min-w-[220px] max-w-[300px]">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPdf ? "bg-red-500/15 text-red-500" : "bg-primary/15 text-primary"}`}>
            {isPdf ? <FileText className="h-5 w-5" /> : <FileIcon className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate" title={name}>{name}</p>
            <p className="text-[11px] text-muted-foreground uppercase">{isPdf ? "PDF document" : (name.split(".").pop() || "file")}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download={name}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition"
            title="Open / Download"
          >
            <Download className="h-4 w-4" />
          </a>
        </div>
        {isPdf && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[11px] text-primary underline"
          >
            Open PDF in new tab
          </a>
        )}
        {caption?.trim() && (
          <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{caption.trim()}</p>
        )}
      </div>
    );
  }

  return <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{text}</p>;
};

export default MessageContent;
