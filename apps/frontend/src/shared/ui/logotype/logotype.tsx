import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface IProps {
  className?: string;
  isMobile?: boolean;
  intervalMs?: number;
  showSiteName?: boolean;
  showLogotype?: boolean;
}

const anims = [
  "logo_anim2.gif",
  "logo_anim3.gif",
  "logo_anim4.gif",
  "logo_anim5.gif",
  "logo_anim6.gif",
  "logo_anim7.gif",
  "logo_anim8.gif",
  "logo_anim9.gif",
  "logo_anim10.gif",
];

const animationDurationMs = 6000;

export const Logotype: React.FC<IProps> = (props) => {
  const {
    className,
    isMobile = false,
    intervalMs = 30000,
    showSiteName = true,
    showLogotype = true,
  } = props;
  const [anim, setAnim] = useState("logo.gif");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);

  const playRandomAnimation = () => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const randomIndex = Math.floor(Math.random() * anims.length);
    const randomAnim = anims[randomIndex];

    setAnim(randomAnim);

    timeoutRef.current = setTimeout(() => {
      setAnim("logo.gif");
      isAnimatingRef.current = false;
    }, animationDurationMs);
  };

  const clearAllTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      playRandomAnimation();
    }, intervalMs);

    return () => {
      clearAllTimers();
    };
  }, [intervalMs]);

  const handleClickLogo = () => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    setAnim("logo_anim1.gif");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setAnim("logo.gif");
      isAnimatingRef.current = false;
    }, 10000);
  };

  return (
    <div
      className={`p-2 flex ${!isMobile && "flex-col"} items-center gap-1 ${className}`}
    >
      {showLogotype ? (
        <Image
          onClick={handleClickLogo}
          src={`/logo/${anim}`}
          alt="Логотип OctoMe"
          width={152}
          height={152}
          unoptimized
          className={`${isMobile ? "w-14 h-14" : "w-38 h-38"} cursor-pointer`}
        />
      ) : null}

      {showSiteName ? (
        <div className="flex items-center">
          <p
            className={`${isMobile ? "text-3xl" : "text-6xl"} font-mono font-black text-[var(--logo-text-color)]`}
          >
            Octo
          </p>
          <p
            className={`${isMobile ? "text-3xl" : "text-6xl"} font-mono font-black text-[var(--ui-primary)] ml-1`}
          >
            Me
          </p>
        </div>
      ) : null}
    </div>
  );
};
