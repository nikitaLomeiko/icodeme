import { IconType } from "react-icons";
import { StepType } from "../../model";
import { FaBook, FaCode, FaQuestion, FaTerminal } from "react-icons/fa";

interface IPalette {
  color: string;
  bg: string;
  ring: string;
  dot: string;
  chip: string;
}

export const stepIcons: Record<StepType, IconType> = {
  document: FaBook,
  code: FaCode,
  terminal: FaTerminal,
  test: FaQuestion,
};

export const getStepPalette = (type: StepType) => {
  const palettes: Record<
    StepType,
    { color: string; bg: string; ring: string; dot: string; chip: string }
  > = {
    document: {
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.14)",
      ring: "rgba(56,189,248,0.45)",
      dot: "#0ea5e9",
      chip: "rgba(56,189,248,0.18)",
    },
    code: {
      color: "#34d399",
      bg: "rgba(52,211,153,0.14)",
      ring: "rgba(52,211,153,0.45)",
      dot: "#10b981",
      chip: "rgba(52,211,153,0.18)",
    },
    terminal: {
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.14)",
      ring: "rgba(167,139,250,0.45)",
      dot: "#8b5cf6",
      chip: "rgba(167,139,250,0.18)",
    },
    test: {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.14)",
      ring: "rgba(251,191,36,0.45)",
      dot: "#f59e0b",
      chip: "rgba(251,191,36,0.18)",
    },
  };
  return palettes[type] ?? palettes.test;
};

export const getStepLabel = (type: StepType) => {
  const labels: Record<StepType, string> = {
    document: "Документ",
    code: "Код",
    terminal: "Терминал",
    test: "Тест",
  };
  return labels[type] ?? labels.test;
};

export const getCardStyle = (
  isComleted: boolean,
  isCurrent: boolean,
  palette: IPalette | undefined,
) => {
  const safePalette = palette ?? getStepPalette("test");
  const cardStyle: React.CSSProperties = isComleted
    ? {
        background: "linear-gradient(135deg, #059669, #10b981)",
        borderColor: "rgba(52,211,153,0.6)",
        boxShadow:
          "0 12px 28px -10px rgba(16,185,129,0.55), inset 0 1px 0 rgba(255,255,255,0.25)",
      }
    : isCurrent
      ? {
          backgroundColor:
            "color-mix(in srgb, var(--ui-background-secondary) 88%, transparent)",
          borderColor: safePalette.ring,
          boxShadow: `${safePalette.ring ? `0 0 0 3px ${safePalette.bg}, 0 12px 28px -8px ${safePalette.chip}` : ""}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          backdropFilter: "blur(8px)",
        }
      : {
          backgroundColor:
            "color-mix(in srgb, var(--ui-background-secondary) 88%, transparent)",
          borderColor: safePalette.ring,
          boxShadow:
            "0 12px 24px -12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        };
  return cardStyle;
};
