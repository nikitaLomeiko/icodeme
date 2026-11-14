export const ProfileDoodle: React.FC = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full text-[var(--ui-text-muted)] opacity-[0.12]"
  >
    <defs>
      <pattern
        id="profile-doodle-pattern"
        width="150"
        height="130"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M18 27h24a5 5 0 0 1 5 5v13a5 5 0 0 1-5 5H31l-7 6v-6h-6a5 5 0 0 1-5-5V32a5 5 0 0 1 5-5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m82 20 3.5 7.5L94 31l-8.5 3.5L82 43l-3.5-8.5L70 31l8.5-3.5L82 20Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="m116 74-10 10 10 10M128 74l10 10-10 10M123 71l-5 26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="35"
          cy="101"
          r="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <ellipse
          cx="35"
          cy="101"
          rx="19"
          ry="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          transform="rotate(-28 35 101)"
        />
        <path
          d="M78 83c-5-7-16 0 0 13 16-13 5-20 0-13Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M84 111h21M94.5 100.5v21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#profile-doodle-pattern)" />
  </svg>
);
