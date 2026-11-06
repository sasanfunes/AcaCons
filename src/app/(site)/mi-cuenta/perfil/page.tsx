import type { Metadata } from "next";
import { requireUser } from "@/server/guards";
import { getMyProfile } from "@/server/queries/account";
import { ChangePasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { Card } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getMyProfile(user.id);
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-bold">Datos personales</h2>
        <ProfileForm profile={profile} />
      </Card>
      <Card className="h-fit p-6">
        <h2 className="mb-4 text-lg font-bold">Contraseña</h2>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
