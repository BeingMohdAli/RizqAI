import type { MessageRecord } from "@/lib/api";
import Markdown from "./Markdown";

// Renders one stored message from a past conversation. Unlike ChatTurn
// (which shows the live plan/research/risk/debate/verdict breakdown as it
// streams), this only has the final saved text — plan/research detail
// isn't persisted per-message, so history shows the finished answer only.
export default function HistoryMessage({ message }: { message: MessageRecord }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-gold/25 bg-gold-soft px-4 py-2.5 text-[15px] text-text sm:max-w-[70%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise-in rounded-2xl rounded-tl-sm border border-line bg-surface/70 p-5 text-[15px] text-text backdrop-blur-sm sm:p-6">
      <Markdown content={message.content} />
    </div>
  );
}