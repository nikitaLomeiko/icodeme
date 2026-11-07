import { TextField } from "@/shared/ui/kit";

interface NameStepProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const NameStep: React.FC<NameStepProps> = ({
  value,
  onChange,
  error,
}) => {
  return (
    <TextField
      id="name"
      name="name"
      placeholder="Ваше имя"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      variant="underline"
      size="lg"
      fullWidth
      inputMode="placeholder"
    />
  );
};
