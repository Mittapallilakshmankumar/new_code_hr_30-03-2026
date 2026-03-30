import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getDefaultRouteForRole, getRoleLabel } from "../utils/constants";
import { useAuth } from "../utils/session";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, role, login, logout, extractErrorMessage } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success] = useState(location.state?.successMessage || "");
  const selectedRole = location.state?.portalRole || "";
  const roleLabel = useMemo(
    () => (selectedRole ? getRoleLabel(selectedRole) : "Internal"),
    [selectedRole]
  );

  useEffect(() => {
    if (location.state?.successMessage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  const handleChange = (field) => (event) => {
    if (error) {
      setError("");
    }

    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) {
      return;
    }

    const username = formData.username.trim();
    const password = formData.password;

    if (!username || !password) {
      setError("Enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await login({ username, password });

      if (selectedRole && user.role !== selectedRole) {
        await logout();
        setError(
          `This account is assigned to ${getRoleLabel(user.role)}. Please use the correct portal card.`
        );
        return;
      }

      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowPassword((current) => !current);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-md"
      >
        <h1 className="text-3xl font-semibold text-gray-800">{roleLabel} Login</h1>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to access the petty cash portal
        </p>

        {selectedRole ? (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Selected access: <span className="font-semibold">{roleLabel}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange("username")}
            autoComplete="username"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-900"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange("password")}
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 outline-none transition focus:border-blue-900"
            />
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handlePasswordToggle}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M3 3 21 21" />
                  <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                  <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 0 1-4.08 5.38" />
                  <path d="M6.61 6.61A11.84 11.84 0 0 0 1 12.5C2.73 16.89 7 20 12 20a10.9 10.9 0 0 0 5.39-1.39" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-blue-900 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
          <Link to="/" className="font-medium text-gray-600 hover:text-gray-800">
            Back to Portal
          </Link>
          <span className="font-medium text-slate-400">Admin-created accounts only</span>
        </div>
      </form>
    </div>
  );
}
