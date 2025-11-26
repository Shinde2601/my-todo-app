// src/Header.jsx
export default function Header() {
  return (
    <header className="text-center mb-3">
      <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
        Todo App
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Small, focused tasks — get things done ✨
      </p>
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </header>
  );
}
