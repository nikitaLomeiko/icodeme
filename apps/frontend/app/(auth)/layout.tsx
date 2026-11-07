import { AuthLayout } from "@/widgets/auth-layout";

export default function AuthLayoutGroup({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
