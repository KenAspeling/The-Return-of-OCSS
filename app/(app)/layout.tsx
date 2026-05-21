import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/app/_components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <Sidebar user={user} />
      <main className="flex-1 px-6 py-10 md:px-12">
        <div className="rise">{children}</div>
      </main>
    </div>
  );
}
