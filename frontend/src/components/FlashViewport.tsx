import type { Flash } from "@/Types/flash";

export default function FlashViewport({ messages }: { messages: Flash[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] space-y-2 flex flex-col-reverse">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded px-4 py-3 text-sm shadow-lg text-white
            ${m.type === "success" ? "bg-green-600" : ""}
            ${m.type === "error" ? "bg-red-600" : ""}
            ${m.type === "info" ? "bg-blue-600" : ""}
          `}
        >
          {m.message}
        </div>
      ))}
    </div>
  );
}
