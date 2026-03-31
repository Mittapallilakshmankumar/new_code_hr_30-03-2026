import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // clear old
    sessionStorage.clear();
    localStorage.clear();

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,   // ✅ FIX (IMPORTANT)
          password: formData.password,
        }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      // if (res.ok) {
      //   // tokens
      //   sessionStorage.setItem("petty-cash-access", data.access);
      //   sessionStorage.setItem("petty-cash-refresh", data.refresh);
      if (res.ok) {
      // tokens
       localStorage.setItem("petty-cash-access", data.access);
      localStorage.setItem("petty-cash-refresh", data.refresh);
       

        // 🔥 IMPORTANT: SET ROLE MANUALLY (TEMP FIX)
        const role = data.role || "employee";   // fallback

        localStorage.setItem("role", role);
        localStorage.setItem("userId", data.user_id || "");
        localStorage.setItem("userName", data.name || "");
        localStorage.setItem("employeeId", data.employee_id || "");

        // redirect
        if (role.toLowerCase() === "admin") {
          navigate("/home");
        } else {
          navigate("/home");
        }

      } else {
        setError("Invalid credentials ❌");
      }

    } catch (err) {
      console.error(err);
      setError("Server error ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#082a57]">
      <div className="bg-white p-8 rounded-xl w-96 shadow-lg">

        <h2 className="text-xl font-bold mb-4 text-center">
          Login
        </h2>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-3 p-2 border rounded"
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-3 p-2 border rounded"
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button className="w-full bg-blue-900 text-white p-2 rounded">
            Login
          </button>
          {/* 🔥 ADD THIS BUTTON */}
  <button
    type="button"
    onClick={() => {
      sessionStorage.setItem("petty-cash-access", "testtoken");
      localStorage.setItem("role", "checker");

      navigate("/accounts");
    }}
    className="w-full mt-3 bg-green-600 text-white p-2 rounded hover:bg-green-500"
  >
    Go to Checker Dashboard
  </button>
        </form>
      </div>
    </div>
  );
}





