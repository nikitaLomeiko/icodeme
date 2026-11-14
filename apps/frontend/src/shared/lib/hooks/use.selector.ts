import { useSelector, type EqualityFn } from "react-redux";

/**
 * Keeps Shared independent from the root store while inferring the state from
 * a slice selector. Slice selectors own the smallest state contract they use.
 */
export function useAppSelector<TState, TSelected>(
  selector: (state: TState) => TSelected,
  equalityFn?: EqualityFn<TSelected>,
) {
  return useSelector(
    selector as unknown as (state: unknown) => TSelected,
    equalityFn,
  );
}
