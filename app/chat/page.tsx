import ChatBox from './ChatBox';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#090b11] text-white flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-[#0f1724] border border-white/10 rounded-[32px] shadow-[0_30px_120px_rgba(15,23,42,0.45)] overflow-hidden">
        <div className="px-8 py-6 border-b border-white/10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Digen</h1>
            <p className="text-zinc-400 max-w-2xl">A clean Mermaid diagram chat UI — ask for flowcharts, UML, DFD, sequence diagrams, and more.</p>
          </div>
        </div>
        <ChatBox />
      </div>
    </main>
  );
}
