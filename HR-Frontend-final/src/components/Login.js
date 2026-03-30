





// import { useState } from "react";
// import { useNavigate } from "react-router-dom";


// export default function Login() {

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
  

//   const [error, setError] = useState("");
//   // 👇 ADD HERE
// const [showPassword, setShowPassword] = useState(false);
  

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       setError("All fields are required ❌");
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();
//       console.log(data);

//       if (res.ok) {
//         alert("Login Successful ✅");

//          localStorage.clear(); 

//         // 🔥 STORE USER DATA
//         localStorage.setItem("isLoggedIn", true);
//         localStorage.setItem("userName", data.name);//this also leve page
//         localStorage.setItem("empId", data.employee_id); // 🔥 IMPORTANT//this also leave 
//         localStorage.setItem("department", data.department);  // ✅ ADD//this si leave apge
//         localStorage.setItem("email", data.email);
//           localStorage.setItem("userId", data.user_id);

//             // 🔥 ADD THIS (VERY IMPORTANT)
//  localStorage.setItem("isAdmin", data.role === "admin" ? "true" : "false");

//         navigate("/home");
//       } else {
//         setError(data.error || "Invalid credentials ❌");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Server error ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#082a57] flex items-center justify-center">

//       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

//         <h2 className="text-2xl font-bold text-center text-[#082a57] mb-6">
//           Employee Login
//         </h2>

//         {/* Error */}
//         {error && (
//           <p className="text-red-500 text-sm mb-4 text-center">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">

//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             onChange={handleChange}
//             required
//             className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#082a57]"
//           />

//           <div className="relative">
//   <input
//     type={showPassword ? "text" : "password"}
//     name="password"
//     placeholder="Password"
//     onChange={handleChange}
//     required
//     className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#082a57]"
//   />

//   <button
//     type="button"
//     onClick={() => setShowPassword(!showPassword)}
//     className="absolute right-3 top-2.5 text-gray-500"
//   >
//     {showPassword ? "🙈" : "👁️"}
//   </button>
// </div>

//           <button
//             type="submit"
//             className="w-full bg-[#082a57] text-white py-2 rounded-lg hover:opacity-90"
//           >
//             Login
//           </button>

//         </form>

//       </div>

//     </div>
//   );
// }








// import { useState } from "react";
// import { useNavigate } from "react-router-dom";


// export default function Login() {

//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
  

//   const [error, setError] = useState("");
//   // 👇 ADD HERE
// const [showPassword, setShowPassword] = useState(false);
  

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       setError("All fields are required ❌");
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();
//       console.log(data);

//       if (res.ok) {
//         alert("Login Successful ✅");

//          localStorage.clear(); 

//         // 🔥 STORE USER DATA
//         localStorage.setItem("isLoggedIn", true);
//         localStorage.setItem("userName", data.name);//this also leve page
//         localStorage.setItem("empId", data.employee_id); // 🔥 IMPORTANT//this also leave 
//         localStorage.setItem("department", data.department);  // ✅ ADD//this si leave apge
//         localStorage.setItem("email", data.email);
//           localStorage.setItem("userId", data.user_id);

//             // 🔥 ADD THIS (VERY IMPORTANT)
//  localStorage.setItem("isAdmin", data.role === "admin" ? "true" : "false");

//         navigate("/home");
//       } else {
//         setError(data.error || "Invalid credentials ❌");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Server error ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#082a57] flex items-center justify-center">

//       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

//         <h2 className="text-2xl font-bold text-center text-[#082a57] mb-6">
//           Employee Login
//         </h2>

//         {/* Error */}
//         {error && (
//           <p className="text-red-500 text-sm mb-4 text-center">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">

//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             onChange={handleChange}
//             required
//             className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#082a57]"
//           />

//           <div className="relative">
//   <input
//     type={showPassword ? "text" : "password"}
//     name="password"
//     placeholder="Password"
//     onChange={handleChange}
//     required
//     className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#082a57]"
//   />

//   <button
//     type="button"
//     onClick={() => setShowPassword(!showPassword)}
//     className="absolute right-3 top-2.5 text-gray-500"
//   >
//     {showPassword ? "🙈" : "👁️"}
//   </button>
// </div>

//           <button
//             type="submit"
//             className="w-full bg-[#082a57] text-white py-2 rounded-lg hover:opacity-90"
//           >
//             Login
//           </button>

//         </form>

//       </div>

//     </div>
//   );
// }



// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       setError("All fields are required ❌");
//       return;
//     }

//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();
//       console.log(data);

//       if (res.ok) {
//         alert("Login Successful ✅");

//         localStorage.clear();

//         // 🔥 STORE USER DATA
//         localStorage.setItem("isLoggedIn", true);
//         localStorage.setItem("userName", data.name);
//         localStorage.setItem("empId", data.employee_id);
//         localStorage.setItem("department", data.department);
//         localStorage.setItem("email", data.email);
//         localStorage.setItem("userId", data.user_id);
//         localStorage.setItem(
//           "isAdmin",
//           data.role === "admin" ? "true" : "false"
//         );

//         navigate("/home");
//       } else {
//         setError(data.error || "Invalid credentials ❌");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Server error ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#082a57] flex items-center justify-center">
//       <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        
//         <h2 className="text-2xl font-bold text-center text-[#082a57] mb-6">
//           Employee Login
//         </h2>

//         {/* Error */}
//         {error && (
//           <p className="text-red-500 text-sm mb-4 text-center">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">

//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             onChange={handleChange}
//             required
//             className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#082a57]"
//           />

//           <div className="relative">
//             <input
//               type={showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               onChange={handleChange}
//               required
//               className="w-full border rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-[#082a57]"
//             />

//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-2.5 text-gray-500"
//             >
//               {showPassword ? "🙈" : "👁️"}
//             </button>
//           </div>

//           {/* 🔵 HR LOGIN */}
//           <button
//             type="submit"
//             className="w-full bg-[#082a57] text-white py-2 rounded-lg hover:opacity-90"
//           >
//             Login
//           </button>

//           {/* 🔥 CHECKER LOGIN BUTTON */}
//           <button
//             type="button"
//             onClick={() => navigate("/checker-dashboard")}
//             className="w-full mt-2 text-sm bg-gray-500 text-white py-2 rounded-lg hover:opacity-90"
//           >
//             Checker Login
//           </button>

//         </form>

//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [role, setRole] = useState("hr"); // 🔥 role selector
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//           // role: role,   // 🔥 send role
//         }),
//       });

//       const data = await res.json();
//       // ✅ HERE
// console.log("ROLE:", data.role);

//       if (res.ok) {
//         // ✅ store token
//         sessionStorage.setItem("petty-cash-access", data.access);
//         sessionStorage.setItem("petty-cash-refresh", data.refresh);

//         // ✅ store role
//         localStorage.setItem("role", data.role);

//         alert("Login Success ✅");

//         // 🔥 redirect based on role
//   const role = data.role?.toLowerCase().trim();



// switch (role) {
//   case "checker":
//     navigate("/checker-dashboard");
//     break;

//   case "admin":   // HR
//     navigate("/home");
//     break;

//   default:
//     navigate("/home");
// }

//       } else {
//         setError("Invalid credentials ❌");
//       }
//     } catch {
//       setError("Server error ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#082a57]">
//       <div className="bg-white p-8 rounded-xl w-96">
//         <h2 className="text-xl font-bold mb-4">Login</h2>

//         {error && <p className="text-red-500">{error}</p>}

//         <form onSubmit={handleSubmit}>

//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full mb-3 p-2 border"
//             onChange={(e) => setFormData({...formData, email: e.target.value})}
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full mb-3 p-2 border"
//             onChange={(e) => setFormData({...formData, password: e.target.value})}
//           />

//           {/* 🔥 ROLE SELECT */}
//           <select
//             className="w-full mb-3 p-2 border"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//           >
//             <option value="hr">HR</option>
//             <option value="checker">Checker</option>
//           </select>

//           <button className="w-full bg-blue-900 text-white p-2">
//             Login
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }








// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // 🔥 Clear only required items (NOT full clear)
//     sessionStorage.removeItem("petty-cash-access");
//     sessionStorage.removeItem("petty-cash-refresh");
//     localStorage.removeItem("role");

//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();

//       console.log("API RESPONSE:", data);

//       if (res.ok) {
//         // ✅ Store tokens
//         sessionStorage.setItem("petty-cash-access", data.access);
//         sessionStorage.setItem("petty-cash-refresh", data.refresh);

//         // ✅ Store user info
//         localStorage.setItem("role", data.role);
//         localStorage.setItem("userId", data.user_id);
//         localStorage.setItem("userName", data.name);
//         localStorage.setItem("employeeId", data.employee_id);

//         // ✅ Role-based redirect
//         const role = data.role?.toLowerCase().trim();

//         if (role === "checker") {
//           navigate("/checker-dashboard");
//         } else {
//           navigate("/home");
//         }

//       } else {
//         setError(data.error || "Invalid credentials ❌");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Server error ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#082a57]">
//       <div className="bg-white p-8 rounded-xl w-96 shadow-lg">

//         <h2 className="text-xl font-bold mb-4 text-center">
//           Employee Login
//         </h2>

//         {error && (
//           <p className="text-red-500 text-center mb-3">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit}>

//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full mb-3 p-2 border rounded"
//             required
//             onChange={(e) =>
//               setFormData({ ...formData, email: e.target.value })
//             }
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full mb-3 p-2 border rounded"
//             required
//             onChange={(e) =>
//               setFormData({ ...formData, password: e.target.value })
//             }
//           />

//           <button className="w-full bg-blue-900 text-white p-2 rounded hover:bg-blue-700">
//             Login
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }




// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // 🔥 Clear old session
//     sessionStorage.removeItem("petty-cash-access");
//     sessionStorage.removeItem("petty-cash-refresh");
//     localStorage.removeItem("role");

//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();

//       console.log("API RESPONSE:", data);

//       if (res.ok) {
//         // ✅ Store tokens
//         sessionStorage.setItem("petty-cash-access", data.access);
//         sessionStorage.setItem("petty-cash-refresh", data.refresh);

//         // ✅ Store user info
//         localStorage.setItem("role", data.role);
//         localStorage.setItem("userId", data.user_id);
//         localStorage.setItem("userName", data.name);
//         localStorage.setItem("employeeId", data.employee_id);

//         // ✅ Role-based redirect
//         const role = data.role?.toLowerCase().trim();

//         if (role === "checker") {
//           navigate("/checker-dashboard");
//         } else {
//           navigate("/home");
//         }

//       } else {
//         setError(data.error || "Invalid credentials ❌");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Server error ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#082a57]">
//       <div className="bg-white p-8 rounded-xl w-96 shadow-lg">

//         <h2 className="text-xl font-bold mb-4 text-center">
//           Employee Login
//         </h2>

//         {error && (
//           <p className="text-red-500 text-center mb-3">
//             {error}
//           </p>
//         )}

//         <form onSubmit={handleSubmit}>

//           {/* Email */}
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full mb-3 p-2 border rounded"
//             required
//             onChange={(e) =>
//               setFormData({ ...formData, email: e.target.value })
//             }
//           />

//           {/* Password */}
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full mb-3 p-2 border rounded"
//             required
//             onChange={(e) =>
//               setFormData({ ...formData, password: e.target.value })
//             }
//           />

//           {/* Login Button */}
//           <button className="w-full bg-blue-900 text-white p-2 rounded hover:bg-blue-700">
//             Login
//           </button>

//           {/* 🔥 TEST BUTTON (CHECKER DASHBOARD) */}
//           <button
//             type="button"
//             onClick={() => {
//               sessionStorage.setItem("petty-cash-access", "testtoken");
//               localStorage.setItem("role", "checker");
//               navigate("/checker-dashboard");
//             }}
//             className="w-full mt-3 bg-green-600 text-white p-2 rounded hover:bg-green-500"
//           >
//             Go to Checker Dashboard
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }




// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // clear old
//     sessionStorage.clear();
//     localStorage.clear();

//     try {
//       const res = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           email: formData.email,   // ✅ FIX (IMPORTANT)
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();
//       console.log("LOGIN RESPONSE:", data);

//       if (res.ok) {
//         // tokens
//         sessionStorage.setItem("petty-cash-access", data.access);
//         sessionStorage.setItem("petty-cash-refresh", data.refresh);

//         // 🔥 IMPORTANT: SET ROLE MANUALLY (TEMP FIX)
//         const role = data.role || "employee";   // fallback

//         localStorage.setItem("role", role);
//         localStorage.setItem("userId", data.user_id || "");
//         localStorage.setItem("userName", data.name || "");
//         localStorage.setItem("employeeId", data.employee_id || "");

//         // redirect
//         if (role.toLowerCase() === "admin") {
//           navigate("/home");
//         } else {
//           navigate("/home");
//         }

//       } else {
//         setError("Invalid credentials ❌");
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Server error ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#082a57]">
//       <div className="bg-white p-8 rounded-xl w-96 shadow-lg">

//         <h2 className="text-xl font-bold mb-4 text-center">
//           Login
//         </h2>

//         {error && <p className="text-red-500 text-center mb-3">{error}</p>}

//         <form onSubmit={handleSubmit}>
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full mb-3 p-2 border rounded"
//             required
//             onChange={(e) =>
//               setFormData({ ...formData, email: e.target.value })
//             }
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full mb-3 p-2 border rounded"
//             required
//             onChange={(e) =>
//               setFormData({ ...formData, password: e.target.value })
//             }
//           />

//           <button className="w-full bg-blue-900 text-white p-2 rounded">
//             Login
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }










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

      if (res.ok) {
        // tokens
        sessionStorage.setItem("petty-cash-access", data.access);
        sessionStorage.setItem("petty-cash-refresh", data.refresh);

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





