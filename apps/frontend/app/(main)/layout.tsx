import { Layout } from "@/widgets/layout";

interface IProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<IProps> = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export default MainLayout;
