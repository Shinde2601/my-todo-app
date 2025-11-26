import { useAuth } from "./AuthProvider";
import { useState, useRef, useEffect } from "react";

// User Menu Component
export default function UserMenu() {
  const { user, signout } = useAuth();
  const [open, setOpen] = useState(false);

  const firstLetter = user?.email?.[0]?.toUpperCase() || "U";

  // close menu on outside click
  const menuRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex justify-end mb-3" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow hover:scale-105 active:scale-95 transition"
      >
        {firstLetter}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg p-3 animate-fadeIn z-50">
          {/* User email */}
          <div className="text-xs text-gray-600 mb-2 px-1 truncate">
            {user.email}
          </div>

          <hr className="my-2" />

          {/* Logout */}
          <button
            onClick={() => signout()}
            className="w-full text-left px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 active:scale-95 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
