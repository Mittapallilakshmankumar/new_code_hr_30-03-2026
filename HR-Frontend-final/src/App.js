

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




import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import DashboardPage from "./accounts/pages/DashboardPage";
import PortalPage from "./accounts/pages/PortalPage";
import { AuthProvider } from "./accounts/utils/session";
import LoginPage from "./accounts/pages/LoginPage";

// ✅ FIXED ProtectedRoute
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("petty-cash-access");

  // ❌ If no token → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ If token exists → allow page
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Login pages */}
          <Route path="/" element={<Login />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}

          {/* Role selection */}
          <Route path="/roles" element={<PortalPage />} />

          {/* Protected Home */}
          <Route
            path="/home/*"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Protected Checker Dashboard */}
          <Route
            path="/checker-dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Home from "./components/Home";
// import Login from "./components/Login";
// import DashboardPage from "./accounts/pages/DashboardPage";
// import PortalPage from "./accounts/pages/PortalPage";
// import LoginPage from "./accounts/pages/LoginPage";
// import AllocateAdvancePage from "./accounts/pages/AllocateAdvancePage";
// import MyExpensesPage from "./accounts/pages/MyExpensesPage";
// import NewExpensePage from "./accounts/pages/NewExpensePage";
// import PendingApprovalPage from "./accounts/pages/PendingApprovalPage";
// import PendingVerificationPage from "./accounts/pages/PendingVerificationPage";
// import UploadBillPage from "./accounts/pages/UploadBillPage";
// import ActiveAdvancesPage from "./accounts/pages/ActiveAdvancesPage";
// import ReportsPage from "./accounts/pages/ReportsPage";
// import AdminDashboardPage from "./accounts/pages/AdminDashboardPage";

// import { AuthProvider } from "./accounts/utils/session";

// // ✅ Protected route
// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem("petty-cash-access");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>

//           {/* Login */}
//           <Route path="/" element={<Login />} />
//           <Route path="/login" element={<LoginPage />} />

//           {/* Role selection */}
//           <Route path="/roles" element={<PortalPage />} />

//           {/* Dashboard */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <DashboardPage />
//               </ProtectedRoute>
//             }
//           />

//           {/* Home */}
//           <Route
//             path="/home"
//             element={
//               <ProtectedRoute>
//                 <Home />
//               </ProtectedRoute>
//             }
//           />

//           {/* Maker routes */}
//           <Route path="/new-expense" element={<ProtectedRoute><NewExpensePage /></ProtectedRoute>} />
//           <Route path="/my-expenses" element={<ProtectedRoute><MyExpensesPage /></ProtectedRoute>} />
//           <Route path="/upload-bill" element={<ProtectedRoute><UploadBillPage /></ProtectedRoute>} />

//           {/* Checker routes */}
//           <Route path="/allocate-advance" element={<ProtectedRoute><AllocateAdvancePage /></ProtectedRoute>} />
//           <Route path="/pending-verification" element={<ProtectedRoute><PendingVerificationPage /></ProtectedRoute>} />
//           <Route path="/pending-approval" element={<ProtectedRoute><PendingApprovalPage /></ProtectedRoute>} />

//           {/* Common */}
//           <Route path="/active-advances" element={<ProtectedRoute><ActiveAdvancesPage /></ProtectedRoute>} />

//           {/* Admin */}
//           <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />

//           {/* Reports */}
//           <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }