import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("All fields are required ❌");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        alert("Login Successful ✅");

         localStorage.clear(); 

        // 🔥 STORE USER DATA
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userName", data.name);//this also leve page
        localStorage.setItem("empId", data.employee_id); // 🔥 IMPORTANT//this also leave 
        localStorage.setItem("department", data.department);  // ✅ ADD//this si leave apge
        localStorage.setItem("email", data.email);
          localStorage.setItem("userId", data.user_id);

            // 🔥 ADD THIS (VERY IMPORTANT)
 localStorage.setItem("isAdmin", data.role === "admin" ? "true" : "false");

        navigate("/home");
      } else {
        setError(data.error || "Invalid credentials ❌");
      }

    } catch (err) {
      console.error(err);
      setError("Server error ❌");
    }
  };

  return (
    <div className="min-h-screen bg-[#082a57] flex items-center justify-center">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-[#082a57] mb-6">
          Employee Login
        </h2>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#082a57]"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#082a57]"
          />

          <button
            type="submit"
            className="w-full bg-[#082a57] text-white py-2 rounded-lg hover:opacity-90"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}