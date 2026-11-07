"use client";

import { Provider } from "react-redux";
import { store } from "../model/store";

interface IProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<IProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
