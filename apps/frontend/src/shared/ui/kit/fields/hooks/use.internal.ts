import { useEffect, useState } from "react";

interface UseInternalProps {
  value?: string | number | readonly string[] | undefined;
  onChange?: (e: any) => void;
}

interface UseInternalReturn {
  internalValue: string | number | readonly string[];
  hasValue: boolean;
  handleChange: (e: any, func?: () => void) => void;
  setInternalValue: (value: string | number | readonly string[]) => void;
}

export const useInternal = ({
  value,
  onChange,
}: UseInternalProps): UseInternalReturn => {
  const [internalValue, setInternalValue] = useState(value || "");

  const hasValue = String(internalValue || "").length > 0;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    func?: () => void,
  ) => {
    setInternalValue(e.target.value);
    onChange?.(e);
    func?.();
  };

  return { internalValue, hasValue, handleChange, setInternalValue };
};
