import type { ActionState } from "@/lib/validation/action";
import { Alert } from "@/components/ui/misc";

export function FormFeedback({ state }: { state: ActionState }) {
  if (state.error) return <Alert tone="danger">{state.error}</Alert>;
  if (state.ok && state.message) return <Alert tone="success">{state.message}</Alert>;
  return null;
}
