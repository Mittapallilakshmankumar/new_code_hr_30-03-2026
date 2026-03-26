
import { useEffect, useState } from "react";

export default function EmployeeRequestsTable() {

  const [requests, setRequests] = useState([]);

  const BASE_URL = "http://127.0.0.1:8000/api/leave";

  // ✅ FETCH LEAVE REQUESTS
  const fetchRequests = async () => {
    try {
      const userId = localStorage.getItem("userId");   // 🔥 GET LOGGED USER

const res = await fetch(`${BASE_URL}/list/?user_id=${userId}`);
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  // ✅ LOAD DATA ON PAGE LOAD
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-x-auto">

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Employee Leave Requests
      </h2>

      <table className="w-full min-w-[900px] text-sm">

        <thead>
          <tr className="text-left border-b border-gray-200 text-gray-600">
            <th className="py-3">Name</th>
            <th className="py-3">ID</th>
            <th className="py-3">Department</th>
            <th className="py-3">Leave Type</th>
            <th className="py-3">From</th>
            <th className="py-3">To</th>
            <th className="py-3">Reason</th>
            <th className="py-3">Status</th>
          </tr>
        </thead>

        <tbody>

          {requests.length === 0 ? (

            <tr>
              <td colSpan="8" className="text-center py-6 text-gray-400">
                No leave requests found
              </td>
            </tr>

          ) : (

            requests.map((request, index) => (

              <tr key={request.id || index} className="border-b border-gray-100">

                <td className="py-3">{request.name || "-"}</td>
                <td className="py-3">{request.employee_id || "-"}</td>
                <td className="py-3">{request.department || "-"}</td>
                <td className="py-3">{request.leave_type || "-"}</td>
                <td className="py-3">{request.from_date || "-"}</td>
                <td className="py-3">{request.to_date || "-"}</td>
                <td className="py-3">{request.reason || "-"}</td>

                <td className="py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : request.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {request.status || "Pending"}
                  </span>
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}