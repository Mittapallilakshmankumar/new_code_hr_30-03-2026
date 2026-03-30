import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationBell from "./NotificationBell";

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export default function Layout({ children, headerContent = null }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      ) : null}

      <div
        className={`fixed left-0 top-0 z-40 h-screen w-[296px] p-4 transition-transform duration-200 lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      <main className="min-h-screen lg:ml-[296px]">
        <div className="mx-auto min-h-screen max-w-[1400px] p-4 sm:p-6">
          <div className="sticky top-4 z-20 mb-6 overflow-visible">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 hover:shadow-md lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <MenuIcon />
                </button>
              </div>

              <div className="ml-auto flex items-center justify-end gap-3 overflow-visible">
                {headerContent}
                <NotificationBell />
              </div>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
