import { FiMinimize2 } from "react-icons/fi";
import { documentOptionStore } from "../../model";

interface IProps {
  children: React.ReactNode;
}

export const ZenModeWrapper: React.FC<IProps> = ({ children }) => {
  const { toggleZenMode } = documentOptionStore;
  return (
    <div className="fixed inset-0 z-50 bg-[var(--ui-background)] overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="sticky top-4 z-10 flex justify-end mb-4">
            <button
              onClick={toggleZenMode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/90 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <FiMinimize2 className="w-4 h-4" />
              <span>Выйти (Esc)</span>
            </button>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
