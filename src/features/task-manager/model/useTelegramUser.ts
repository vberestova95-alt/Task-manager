import { useEffect, useState } from "react";

import { setupTelegramApp } from "@/shared/lib/telegram";

import type { TelegramUser } from "./types";

export function useTelegramUser() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const webApp = setupTelegramApp();
    const user = webApp?.initDataUnsafe?.user;

    if (!user) {
      return;
    }

    setTelegramUser({
      name: user.first_name ?? "V",
      username: user.username ? `@${user.username}` : "@vberestova12",
      avatar: user.photo_url
    });
  }, []);

  return telegramUser;
}
