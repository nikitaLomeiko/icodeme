import { AuthLayout } from "@/widgets/auth-layout";

interface IProps {
  children: React.ReactNode;
}

const AuthLayoutGroup: React.FC<IProps> = ({ children }) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default AuthLayoutGroup;
