import {
  LayoutDashboard,
  GitBranch,
  Users,
  AlertCircle,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-[#080808] border-r border-[#161616]">
      <h1 className="text-xl font-bold mb-8">GitHub Visualizer</h1>

      <nav className="space-y-4">
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active
        />
        <NavItem icon={<GitBranch size={18} />} label="Repositories" />
        <NavItem icon={<Users size={18} />} label="Contributors" />
        <NavItem icon={<AlertCircle size={18} />} label="Issues" />
        <NavItem icon={<Settings size={18} />} label="Settings" />
      </nav>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
        active
          ? "bg-zinc-800 text-white"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
