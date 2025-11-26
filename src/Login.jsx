// src/Login.jsx
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function Login() {
  const { signin, signup, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await signin(email, password);
      }
    } catch (err) {
      setError(err?.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-tr from-sky-50 via-white to-rose-50">
      <div className="absolute inset-0 pointer-events-none">
        {/* subtle decorative shapes */}
        <div className="absolute -left-32 -top-20 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -right-28 -bottom-24 w-80 h-80 bg-gradient-to-br from-pink-200 to-amber-200 rounded-full opacity-25 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow text-white text-lg font-bold">
                ✓
              </div>
              <div className="items-center">
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {isSignup ? "Create your account" : "Welcome back"}
                </h1>
                <p className="text-xs text-gray-500">
                  {isSignup
                    ? "Create an account to sync your todos across devices."
                    : "Sign in to access your synced todos."}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-label="auth form"
            >
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                autoComplete="email"
              />

              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className="w-full pr-12 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your secure password"
                  required
                  disabled={loading}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 rounded"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg shadow hover:scale-[1.01] active:scale-95 transition transform disabled:opacity-60"
              >
                {loading
                  ? "Please wait…"
                  : isSignup
                  ? "Create account"
                  : "Sign in"}
              </button>
            </form>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white hover:shadow-sm px-3 py-2 text-sm transition disabled:opacity-60"
                aria-label="Continue with Google"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M21.6 12.227c0-.72-.065-1.409-.186-2.065H12v3.91h5.524c-.238 1.28-.96 2.365-2.05 3.096v2.57h3.316c1.943-1.79 3.06-4.42 3.06-7.511z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 22c2.7 0 4.97-.9 6.63-2.45l-3.316-2.57c-.92.62-2.1.99-3.313.99-2.55 0-4.706-1.73-5.48-4.06H2.93v2.56C4.57 19.94 8 22 12 22z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.52 13.94A6.99 6.99 0 0 1 6 12c0-.66.11-1.3.31-1.9V7.52H2.93A10 10 0 0 0 2 12c0 1.62.38 3.15 1.03 4.52l3.49-2.58z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 6.36c1.47 0 2.8.5 3.84 1.47l2.88-2.88C16.95 2.9 14.68 2 12 2 8 2 4.57 4.06 2.93 7.52l3.38 2.58C7.29 8.09 9.45 6.36 12 6.36z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                onClick={() => setIsSignup((s) => !s)}
                disabled={loading}
                className="px-3 py-2 text-sm text-gray-600"
              >
                {isSignup ? "Have an account?" : "Create"}
              </button>
            </div>

            <div className="mt-4 text-xs text-center text-gray-500">
              By continuing, you agree to the{" "}
              <span className="underline">Terms</span> and{" "}
              <span className="underline">Privacy</span>.
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="text-xs">Need help? </span>
          <a
            className="text-blue-600 hover:underline"
            href="mailto:support@example.com"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
