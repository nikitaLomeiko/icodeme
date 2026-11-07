import { useSelector } from "react-redux";
import type { RootState } from "@/app/providers/redux-store";

export const useAppSelector = useSelector.withTypes<RootState>();
