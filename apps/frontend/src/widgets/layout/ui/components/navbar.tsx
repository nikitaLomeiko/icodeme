"use client";

import { ITab } from "../../model/types/tab.type";
import { Tab } from "./ui/tab.mobile";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaCog } from "react-icons/fa";
import { getTabHref, isTabActive } from "../../model/lib/tab-navigation";

interface IProps {
  tabs: ITab[];
}

export const Navbar: React.FC<IProps> = (props) => {
  const { tabs } = props;

  const centerIndex = Math.floor(tabs.length / 2);
  const homeTab = tabs.find((tab) => tab.id === "/");
  const mobileTabs = tabs.filter((tab) => tab.id !== "/");

  if (homeTab) {
    mobileTabs.splice(centerIndex, 0, homeTab);
  }
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleTabSetSelectedId = (id: string) => {
    if (id === "Other") {
      setIsMoreOpen((isOpen) => !isOpen);
      return;
    }

    setIsMoreOpen(false);
    router.push(getTabHref(id));
  };

  const openSettings = () => {
    setIsMoreOpen(false);
    router.push("/settings");
  };

  return (
    <div className="relative">
      {isMoreOpen && (
        <div className="absolute bottom-full right-4 mb-3 w-48 rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-secondary)] p-2 shadow-xl">
          <button
            type="button"
            onClick={openSettings}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[var(--ui-text-secondary)] transition-colors hover:bg-[var(--ui-primary)]/10 hover:text-[var(--ui-primary)]"
          >
            <FaCog className="text-[var(--ui-text-muted)]" />
            <span>Настройки</span>
          </button>
        </div>
      )}
      <div className="bg-[var(--ui-background-secondary)] rounded-3xl flex items-center justify-between px-4 py-3 mx-2 min-w-[326px] relative">
        {mobileTabs.map((tab, index) => {
          const isCenter = index === centerIndex;
          const isActive =
            isTabActive(pathname, tab.id) || (tab.id === "Other" && isMoreOpen);

          return (
            <div key={tab.id} className={isCenter ? "relative -mt-10" : ""}>
              <Tab
                {...tab}
                onActive={() => handleTabSetSelectedId(tab.id)}
                isCenter={isCenter}
                isActive={isActive}
              />
            </div>
          );
        })}

        <div className="absolute -top-[1px] left-1/2 transform -translate-x-1/2 w-[72px] h-6 pointer-events-none"></div>
      </div>
    </div>
  );
};
