import { TextField } from "@/shared/ui/kit";

interface IProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const NameStep: React.FC<IProps> = ({ value, onChange, error }) => {
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
