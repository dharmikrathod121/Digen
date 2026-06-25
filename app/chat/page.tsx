import ChatBox from './ChatBox';
import BackTopNav from './BackTopNav';

export default function Page() {
  return (
    <main className="h-screen bg-[#090b11] text-white flex flex-col">
      <BackTopNav />
      <div className="flex-1">
        <ChatBox />
      </div>
    </main>
  );
}


