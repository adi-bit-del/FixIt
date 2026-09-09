import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function CustomerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--fixit-background)] text-[var(--fixit-text)]">
      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1 lg:pl-0">
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
          />

          <main className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-[1440px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}