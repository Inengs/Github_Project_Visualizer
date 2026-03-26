import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <NavBar />

        <main className="p-6 overflow-y-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
