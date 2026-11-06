"use client";
import { useActionState } from "react";
import { registerEventAction } from "@/server/actions/events";
import { initialState } from "@/lib/validation/action";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/misc";

export function RegisterEventButton({ eventId, full }: { eventId: string; full: boolean }) {
  const [state, action] = useActionState(registerEventAction, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="eventId" value={eventId} />
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.ok ? (
        <Alert tone="success">{state.message}</Alert>
      ) : (
        <SubmitButton className="w-full" size="lg" pendingText="Inscribiendo…">
          {full ? "Anotarme en lista de espera" : "Inscribirme gratis"}
        </SubmitButton>
      )}
    </form>
  );
}
