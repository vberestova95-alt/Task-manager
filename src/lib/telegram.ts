declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  close: () => void;
  colorScheme?: "light" | "dark";
  initDataUnsafe?: {
    user?: {
      first_name?: string;
      username?: string;
      photo_url?: string;
    };
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  enableClosingConfirmation?: () => void;
};

export function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

export function setupTelegramApp() {
  const webApp = getTelegramWebApp();

  if (!webApp) {
    return null;
  }

  webApp.ready();
  webApp.expand();
  webApp.setHeaderColor?.("#24254d");
  webApp.setBackgroundColor?.("#24254d");
  webApp.enableClosingConfirmation?.();

  return webApp;
}
