
import {
  LayoutDashboard,
  UserPlus,
  FileText,
  ClipboardCheck,
  ClipboardList,
  LogOut   // ✅ add this
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menu = [
  { name: "Home", path: "/home", icon: LayoutDashboard },
  { name: "Onboarding", path: "/home/onboarding", icon: UserPlus },
  { name: "Leave", path: "/home/leave", icon: FileText },
  { name: "Attendance", path: "/home/attendance", icon: ClipboardCheck },
  { name: "Admin Dashboard", path: "/home/leaveapprove", icon: ClipboardList },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ add

  const handleLogout = () => {
    localStorage.clear(); // clear login data
    navigate("/login");   // redirect
  };

  return (
    <div className="w-24 min-h-screen bg-[#082a57] text-white flex flex-col items-center py-6 justify-between">
      
      {/* TOP */}
      <div>
        <h1 className="text-lg font-bold mb-10">HRMS</h1>

        <div className="flex flex-col gap-8">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center text-xs"
              >
                <div
                  className={`p-3 rounded-xl ${
                    active ? "bg-white/20" : "hover:bg-white/10 text-gray-300"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <span className="mt-2">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 🔴 LOGOUT (BOTTOM) */}
      <div className="flex flex-col items-center text-xs cursor-pointer">
        <div
          onClick={handleLogout}
          className="p-3 rounded-xl hover:bg-red-500/80 bg-red-500/60"
        >
          <LogOut size={22} />
        </div>
        <span className="mt-2">Logout</span>
      </div>

    </div>
  );
}