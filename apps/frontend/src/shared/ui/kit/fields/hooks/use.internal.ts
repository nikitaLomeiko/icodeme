import { useState } from "react";

type FieldElement = HTMLInputElement | HTMLTextAreaElement;

interface UseInternalProps<TElement extends FieldElement> {
  value?: string | number | readonly string[] | undefined;
  onChange?: React.ChangeEventHandler<TElement>;
}

interface UseInternalReturn<TElement extends FieldElement> {
  internalValue: string | number | readonly string[];
  hasValue: boolean;
  handleChange: (e: React.ChangeEvent<TElement>, func?: () => void) => void;
  setInternalValue: (value: string | number | readonly string[]) => void;
}

export const useInternal = <TElement extends FieldElement = HTMLInputElement>({
  value,
  onChange,
}: UseInternalProps<TElement>): UseInternalReturn<TElement> => {
  const [uncontrolledValue, setUncontrolledValue] = useState<
    string | number | readonly string[]
  >(value ?? "");
  const internalValue = value ?? uncontrolledValue;

  const hasValue = String(internalValue || "").length > 0;

  const handleChange = (e: React.ChangeEvent<TElement>, func?: () => void) => {
    setUncontrolledValue(e.target.value);
    onChange?.(e);
    func?.();
  };

  return {
    internalValue,
    hasValue,
    handleChange,
    setInternalValue: setUncontrolledValue,
  };
};
