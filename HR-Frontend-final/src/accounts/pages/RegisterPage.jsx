import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../components/AppProviders";

export default function RegisterPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <h1 className="text-3xl font-semibold text-gray-800">Registration Disabled</h1>
        <p className="mt-2 text-sm text-gray-500">
          Public account registration is currently disabled for this internal system.
        </p>
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          User accounts must be created by an administrator. The registration page has been kept in code for future use, but self-service signup is turned off.
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-900 hover:text-blue-800">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
