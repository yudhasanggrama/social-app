import { useCallback, useMemo, useState } from "react";
import type { Flash, FlashType } from "@/Types/flash";
import { FlashContext } from "./FlashContext";
import FlashViewport from "@/components/FlashViewport";

export function FlashMessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Flash[]>([]);

  const remove = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const show = useCallback(
    (type: FlashType, message: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);

      setMessages((prev) => [...prev, { id, type, message }]);

      // auto dismiss 3 detik
      setTimeout(() => remove(id), 3000);
    },
    [remove]
  );

  const value = useMemo(
    () => ({ show, messages, remove }),
    [show, messages, remove]
  );

  return (
    <FlashContext.Provider value={value}>
      {children}
      <FlashViewport messages={messages} />
    </FlashContext.Provider>
  );
}
