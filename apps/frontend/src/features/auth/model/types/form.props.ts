export interface IBaseFormProps {
  onSuccess?: () => void;
  setError: (message: string | null) => void;
}
