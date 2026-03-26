import { Search, Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center bg-zinc-800 px-3 py-2 rounded-lg w-96">
        <Search size={16} className="text-zinc-400" />
        <input
          type="text"
          placeholder="Enter GitHub repo (e.g. facebook/react)"
          className="bg-transparent outline-none ml-2 text-sm w-full"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <Bell className="text-zinc-400 cursor-pointer" />
        <User className="text-zinc-400 cursor-pointer" />
      </div>
    </header>
  );
}
