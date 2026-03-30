

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./components/Home";
// import Login from "./components/Login";



// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* DEFAULT PAGE → LOGIN */}
//         <Route path="/" element={<Login />} />

//         {/* LOGIN PAGE */}
//         <Route path="/login" element={<Login />} />

//         {/* HOME PAGE */}
//         <Route path="/home/*" element={<Home />} />

       

//       </Routes>
//     </BrowserRouter>
//   );
// }





// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./components/Home";
// import Login from "./components/Login";
// import DashboardPage from "./accounts/pages/DashboardPage";
// import { AuthProvider } from "./accounts/utils/session";

// // 🔥 TEMP Protected Route (allows access without strict login)
// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem("petty-cash-access");

//   // ✅ Allow access even if token is missing (for testing)
//   if (!token) {
//     console.log("No token, but allowing access for testing");
//     return children;
//   }

//   return children;
// };

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>

//           {/* ✅ LOGIN PAGE */}
//           <Route path="/" element={<Login />} />
//           <Route path="/login" element={<Login />} />

//           {/* ✅ HOME PAGE */}
//           <Route
//             path="/home/*"
//             element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             }
//           />

//           {/* ✅ CHECKER DASHBOARD */}
//           <Route
//             path="/checker-dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />

//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }




// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./components/Home";
// import Login from "./components/Login";
// import DashboardPage from "./accounts/pages/DashboardPage";
// import PortalPage from "./accounts/pages/PortalPage"; // ✅ ADD THIS
// import { AuthProvider } from "./accounts/utils/session";
// import LoginPage from "./accounts/pages/LoginPage";

// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem("petty-cash-access");

//   if (!token) {
//     return children;
//   }

//   return children;
// };

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>

//           <Route path="/" element={<Login />} />
//           <Route path="/login" element={<LoginPage />} />

//           {/* ✅ ADD THIS ROUTE */}
//           <Route path="/roles" element={<PortalPage />} />

//           <Route
//             path="/home/*"
//             element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/checker-dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />

//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }




// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Home from "./components/Home";
// import Login from "./components/Login";





// // ✅ FIXED ProtectedRoute
// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem("petty-cash-access");

//   // ❌ If no token → go to login
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // ✅ If token exists → allow page
//   return children;
// };

// export default function App() {
//   return (
    
//       <BrowserRouter>
//         <Routes>

//           {/* Login pages */}
//           <Route path="/" element={<Login />} />
//           {/* <Route path="/login" element={<LoginPage />} /> */}
//            {/* <Route path="/login" element={<LoginPage />} /> */}

//           {/* Role selection */}
       

//           {/* Protected Home */}
//           <Route
//             path="/home/*"
//             element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             }
//           />

//           {/* Protected Checker Dashboard */}
         

//         </Routes>
//       </BrowserRouter>
    
//   );
// }



// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./components/Login";
// import PortalPage from "./accounts/pages/PortalPage"
// import Home from "./components/Home";

// // ✅ Protected Route
// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem("petty-cash-access");

//   if (!token) {
//     return <Navigate to="/" />;
//   }

//   return children;
// };

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Login */}
//         <Route path="/" element={<Login />} />

//         {/* Checker Dashboard */}
//         <Route
//           path="/accounts"
//           element={
//             <ProtectedRoute>
//               <PortalPage />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }



// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// import Login from "./components/Login";
// import Home from "./components/Home";
// import PortalPage from "./accounts/pages/PortalPage";

// // ✅ Simple Protected Route (your version)
// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem("petty-cash-access");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* ✅ Login */}
//         <Route path="/" element={<Login />} />
//         <Route path="/login" element={<Login />} />

//         {/* ✅ Portal (Main dashboard entry) */}
//         <Route
//           path="/accounts"
//           element={
//             <ProtectedRoute>
//               <PortalPage />
//             </ProtectedRoute>
//           }
//         />

//         {/* ✅ Home (optional page) */}
//         <Route
//           path="/home"
//           element={
//             <ProtectedRoute>
//               <Home />
//             </ProtectedRoute>
//           }
//         />

//         {/* ✅ Catch all */}
//         <Route path="*" element={<Navigate to="/" replace />} />

//       </Routes>
//     </BrowserRouter>
//   );
// }



import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Home from "./components/Home";
import PortalPage from "./accounts/pages/PortalPage";

// 🔥 ADD THIS (friend auth system)
import { useAuth } from "./accounts/components/AppProviders";
import { getDefaultRouteForRole } from "./accounts/components/appCore";

// ✅ UPDATED Protected Route (SMART VERSION)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  // ⏳ wait for auth check
  if (isBootstrapping) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  // ❌ not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Portal */}
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <PortalPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* 🔥 OPTIONAL: Auto redirect based on role */}
        <Route
          path="/redirect"
          element={<AutoRedirect />}
        />

        {/* ❌ fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

// 🔥 AUTO REDIRECT COMPONENT
function AutoRedirect() {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" />;

  return <Navigate to={getDefaultRouteForRole(role)} replace />;
}