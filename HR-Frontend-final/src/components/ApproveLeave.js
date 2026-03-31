import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import HrApprovalTable from "./HrApprovalTable";
import EmployeesList from "./EmployeesList";
import CandidatesList from "./CandidatesList";

export default function ApproveLeave() {

  // ✅ Always admin access
  const [isAdminLogged] = useState(true);

  // ✅ Stats
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    half_day: 0
  });

  // ✅ Attendance table data
  const [attendanceData, setAttendanceData] = useState([]);

  // 🔥 FETCH ATTENDANCE
  useEffect(() => {
    if (isAdminLogged) {

      const fetchData = () => {
        fetch("http://127.0.0.1:8000/api/attendance/admin-dashboard/")
          .then(res => res.json())
          .then(data => {

            console.log("🔥 DATA:", data);

            setAttendanceData(data);

            let total = data.length;
            let present = 0;
            let absent = 0;

            data.forEach(emp => {
              const status = (emp.today_status || "")
                .toString()
                .trim()
                .toLowerCase();

              if (status === "present") {
                present++;
              } else {
                absent++;
              }
            });

            setStats({
              total,
              present,
              absent,
              half_day: 0
            });

          })
          .catch(err => console.log(err));
      };

      fetchData();

      const interval = setInterval(fetchData, 1000);
      return () => clearInterval(interval);
    }
  }, [isAdminLogged]);

  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">

        {/* 🔥 DIRECT DASHBOARD (NO LOGIN) */}
        <div className="space-y-6">

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="bg-white p-5 rounded-2xl shadow">
              <p>Total Employees</p>
              <h2 className="text-3xl font-bold">{stats.total}</h2>
            </div>

            <div className="bg-green-100 p-5 rounded-2xl">
              <p>Present</p>
              <h2 className="text-3xl font-bold">{stats.present}</h2>
            </div>

            <div className="bg-red-100 p-5 rounded-2xl">
              <p>Absent</p>
              <h2 className="text-3xl font-bold">{stats.absent}</h2>
            </div>

            <div className="bg-yellow-100 p-5 rounded-2xl">
              <p>Half Day</p>
              <h2 className="text-3xl font-bold">{stats.half_day}</h2>
            </div>

          </div>

          {/* TABLE */}
          <h2 className="font-bold text-lg">Attendance Table</h2>

          <table className="w-full border bg-white">
            <thead>
              <tr>
                <th className="border p-2">Emp ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Present</th>
                <th className="border p-2">Absent</th>
                <th className="border p-2">Total</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.map((emp) => (
                <tr key={emp.emp_id} className="text-center">

                  <td className="border p-2">{emp.emp_id}</td>
                  <td className="border p-2">{emp.name}</td>

                  <td
                    className={`border p-2 font-bold ${
                      emp.today_status === "Present"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {emp.today_status}
                  </td>

                  <td className="border p-2 text-green-600">
                    {emp.present_days}
                  </td>

                  <td className="border p-2 text-red-600">
                    {emp.absent_days}
                  </td>

                  <td className="border p-2">
                    {emp.total_days}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Other Components */}
          <HrApprovalTable />
          <EmployeesList />
          <CandidatesList />

        </div>

      </div>

    </div>
  );
}