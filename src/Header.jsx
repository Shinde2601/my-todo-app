// src/Header.jsx
import { useAuth } from "./AuthProvider";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { user, signout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const firstLetter = user?.email?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <header className="mb-4">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title + subtitle */}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Todo App
          </h1>
          <p className="text-sm text-gray-500 mt-1 truncate">
            Small, focused tasks — get things done ✨
          </p>
        </div>

        {/* Right: User avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            title={user?.email || "User"}
            className="flex items-center gap-3 px-2 py-1 rounded-full hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          >
            <div
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow"
              aria-hidden="true"
            >
              {firstLetter}
            </div>
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-lg p-3 animate-fadeIn z-50"
              role="menu"
              aria-label="User menu"
            >
              <div
                className="text-xs text-gray-600 mb-2 px-1 truncate"
                title={user?.email}
              >
                {user?.email || "No email"}
              </div>

              <div className="pb-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    signout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50 transition"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>

              <hr className="border-t border-gray-100 my-1" />
              <div className="text-xs text-gray-400">Signed in</div>
            </div>
          )}
        </div>
      </div>

      {/* subtle divider */}
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </header>
  );
}
