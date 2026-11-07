import { FiLock, FiRefreshCw, FiX } from "react-icons/fi";
import { PREVIEW_DEVICES } from "../../consts";
import { PreviewDevice } from "../../types";

interface IProps {
  address: string;
  device: PreviewDevice;
  withDevices: boolean;
  onDeviceChange: (device: PreviewDevice) => void;
  onRefresh: () => void;
  onClose?: () => void;
}

export const PreviewHeader: React.FC<IProps> = (props) => {
  const { address, device, withDevices, onDeviceChange, onRefresh, onClose } =
    props;

  return (
    <div className="flex items-center gap-3 border-b border-[var(--ui-border)] bg-[var(--ui-background-secondary)] px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-2 shrink-0">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>

      <div className="flex flex-1 items-center justify-center min-w-0">
        <div className="flex w-full max-w-md items-center gap-1.5 rounded-md border border-[var(--ui-border)] bg-[var(--ui-background-tertiary)] px-3 py-1">
          <FiLock className="w-3 h-3 shrink-0 text-[var(--ui-success)]" />
          <span className="truncate text-xs text-[var(--ui-text-muted)] select-none">
            {address}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {withDevices &&
          PREVIEW_DEVICES.map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onDeviceChange(id)}
              className={`rounded-lg p-1.5 transition-all ${
                device === id
                  ? "bg-[var(--ui-text)]/5 text-[var(--ui-primary)]"
                  : "text-[var(--ui-text-muted)] hover:bg-[var(--ui-text)]/5 hover:text-[var(--ui-primary)]"
              }`}
              title={title}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}

        <button
          onClick={onRefresh}
          className="rounded-lg p-1.5 text-[var(--ui-text-muted)] hover:bg-[var(--ui-text)]/5 hover:text-[var(--ui-primary)] transition-all"
          title="Refresh"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--ui-text-muted)] hover:bg-[var(--ui-text)]/5 hover:text-[var(--ui-error)] transition-all"
            title="Close preview"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
