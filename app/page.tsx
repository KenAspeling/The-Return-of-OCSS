import { QuickEntry } from "./_components/quick-entry";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">OCSS</span>
        <h1 className="text-4xl font-semibold">Track time like you talk.</h1>
        <p className="text-zinc-400">
          Type what you did. We file it, bill it, and chase it down.
        </p>
      </header>
      <QuickEntry />
    </main>
  );
}
