import type { StepType } from "@/entities/study";

const colors: Record<StepType, string> = {
  document: "#38bdf8",
  code: "#34d399",
  terminal: "#a78bfa",
  test: "#fb923c",
};

interface IProps {
  type: StepType;
}

export const StepIllustration: React.FC<IProps> = ({ type }) => {
  const color = colors[type] ?? colors.test;

  return (
    <div
      aria-hidden="true"
      className="mb-5 overflow-hidden rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-background-tertiary)]"
    >
      <svg viewBox="0 0 320 170" className="h-auto w-full" fill="none">
        <circle cx="260" cy="25" r="75" fill={color} opacity="0.08" />
        <circle cx="38" cy="155" r="80" fill={color} opacity="0.08" />
        <circle cx="268" cy="137" r="3" fill={color} opacity="0.7" />
        <circle cx="62" cy="35" r="2" fill={color} opacity="0.6" />
        <path
          d="M270 49h12m-6-6v12M47 115h12m-6-6v12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {type === "document" && (
          <>
            <rect
              x="104"
              y="24"
              width="116"
              height="132"
              rx="11"
              fill={color}
              opacity="0.15"
              transform="rotate(7 104 24)"
            />
            <rect
              x="94"
              y="18"
              width="116"
              height="132"
              rx="11"
              fill="var(--ui-background-secondary)"
              stroke={color}
              strokeWidth="2"
            />
            <path
              d="M171 18v27h39"
              stroke={color}
              strokeWidth="2"
              opacity="0.5"
            />
            <rect x="111" y="40" width="44" height="7" rx="3.5" fill={color} />
            <path
              d="M111 65h80M111 77h80M111 89h62M111 109h80M111 121h51"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path d="M174 114v26l9-6 9 6v-26" fill={color} opacity="0.8" />
          </>
        )}

        {type === "code" && (
          <>
            <rect
              x="50"
              y="34"
              width="220"
              height="110"
              rx="12"
              fill="var(--ui-background-secondary)"
              stroke={color}
              strokeWidth="2"
            />
            <path
              d="M50 57h220"
              stroke={color}
              strokeWidth="2"
              opacity="0.55"
            />
            <circle cx="67" cy="46" r="4" fill={color} />
            <circle cx="81" cy="46" r="4" fill={color} opacity="0.55" />
            <circle cx="95" cy="46" r="4" fill={color} opacity="0.3" />
            <path
              d="m119 78-16 14 16 14m82-28 16 14-16 14m-30-36-19 45"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M67 70h21M67 82h13M67 94h20M67 106h11M233 72h19M233 84h11M233 96h20"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.45"
            />
          </>
        )}

        {type === "terminal" && (
          <>
            <rect
              x="48"
              y="28"
              width="224"
              height="116"
              rx="12"
              fill="var(--ui-background-secondary)"
              stroke={color}
              strokeWidth="2"
            />
            <path
              d="M48 54h224"
              stroke={color}
              strokeWidth="2"
              opacity="0.55"
            />
            <circle cx="66" cy="41" r="4" fill={color} />
            <circle cx="80" cy="41" r="4" fill={color} opacity="0.55" />
            <circle cx="94" cy="41" r="4" fill={color} opacity="0.3" />
            <path
              d="m84 76 14 11-14 11m28 0h18m-46 15h102m-102 10h72"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="224"
              y="105"
              width="8"
              height="18"
              rx="2"
              fill={color}
              opacity="0.8"
            />
          </>
        )}

        {type === "test" && (
          <>
            <rect
              x="99"
              y="27"
              width="122"
              height="126"
              rx="12"
              fill="var(--ui-background-secondary)"
              stroke={color}
              strokeWidth="2"
            />
            <rect x="130" y="18" width="60" height="18" rx="7" fill={color} />
            <path
              d="m116 63 6 6 10-12m-16 34 6 6 10-12m-16 34 6 6 10-12"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M144 63h55M144 91h55M144 119h39"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.45"
            />
            <circle cx="233" cy="126" r="25" fill={color} />
            <path
              d="M233 111v16l9 5"
              stroke="var(--ui-background-secondary)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

      </svg>
    </div>
  );
};
