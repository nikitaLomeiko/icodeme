import { TextareaField } from "@/shared/ui/kit";

interface IProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const AboutStep: React.FC<IProps> = ({ value, onChange, error }) => {
  return (
    <TextareaField
      id="bio"
      name="bio"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="О себе..."
      error={error}
      variant="underline"
      size="lg"
      fullWidth
      rows={1}
      autoExpand
      maxRows={10}
      inputMode="static"
    />
  );
};
