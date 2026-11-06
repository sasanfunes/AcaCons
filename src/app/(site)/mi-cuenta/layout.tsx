import { requireUser } from "@/server/guards";
import { AccountNav } from "@/components/account/account-nav";
import { Container } from "@/components/ui/misc";

export default async function AccountLayout({ children }: LayoutProps<"/mi-cuenta">) {
  const user = await requireUser("/mi-cuenta");
  return (
    <Container className="py-10">
      <h1 className="text-2xl font-bold sm:text-3xl">Hola, {user.name.split(" ")[0]}</h1>
      <p className="mb-6 text-ink-600">{user.email}</p>
      <AccountNav />
      {children}
    </Container>
  );
}
