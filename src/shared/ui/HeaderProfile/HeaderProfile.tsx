import "./HeaderProfile.css";

import { ChevronRightIcon } from "@/shared/ui/icons";

type HeaderProfileProps = {
  telegramUser: {
    name: string;
    username: string;
    avatar?: string;
  } | null;
};

export function HeaderProfile({ telegramUser }: HeaderProfileProps) {
  return (
    <div className="profile-header">
      <div className="profile-left">
        <div className="profile-avatar">
          {telegramUser?.avatar ? <img src={telegramUser.avatar} alt={telegramUser.name} /> : <span />}
        </div>
        <div className="profile-name">{telegramUser?.username ?? "@vberestova12"}</div>
        <ChevronRightIcon />
      </div>
      <div className="profile-chip">standart</div>
    </div>
  );
}
