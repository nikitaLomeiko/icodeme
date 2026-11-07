import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/app/providers/redux-store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
