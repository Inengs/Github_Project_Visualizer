import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import type { Range } from "../../types/type";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar
        owner={""}
        repo={""}
        activeTab={""}
        onTabChange={function (tab: string): void {
          throw new Error("Function not implemented.");
        }}
      />

      <div className="flex-1 flex flex-col">
        <NavBar
          title={""}
          subtitle={""}
          range={"7d"}
          onRangeChange={function (range: Range): void {
            throw new Error("Function not implemented.");
          }}
          onRefresh={function (): void {
            throw new Error("Function not implemented.");
          }}
        />

        <main className="p-6 overflow-y-auto flex-1">{children}</main>
      </div>
    </div>
  );
}
