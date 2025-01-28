import { LeftSidebar } from "@/components/chat/left-sidebar";
import { SocketProvider } from "@/providers/socket-provider";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex justify-center items-center min-h-screen bg-[#e5f0f6] pt-12 pb-12 pl-36 pr-36">
        <div className="flex w-full max-w-6xl h-[82vh] bg-white rounded-lg shadow-lg overflow-auto">
          <SocketProvider>
            <LeftSidebar />
            {children}
          </SocketProvider>
        </div>
      </div>
  );
}
