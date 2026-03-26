
import { useState, useEffect } from "react";

export default function EmployeeRequestForm({ onAddRequest }) {

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    department: "",
    leaveType: "Sick Leave",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  // 🔥 FETCH EMPLOYEE DATA (AUTO FILL)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log("USER ID:", userId);   // ✅ ADD THIS


    fetch(`http://127.0.0.1:8000/api/leave/employee/${userId}/`)
      .then(res => res.json())
      .then(data => {
          console.log("API DATA:", data);
        setFormData(prev => ({

          ...prev,
          employeeName: data.name,
          employeeId: data.employee_id,
          department: data.department
        }));
      });
  }, []);

  // 🔥 HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔥 SUBMIT LEAVE
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      user_id: localStorage.getItem("userId"),
      leave_type: formData.leaveType,
      from_date: formData.fromDate,
      to_date: formData.toDate,
      reason: formData.reason,
    };

    await fetch("http://127.0.0.1:8000/api/leave/apply/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    alert("Leave Applied Successfully ✅");

    onAddRequest();

    // 🔥 RESET ONLY FORM FIELDS (NOT EMPLOYEE DATA)
    setFormData(prev => ({
      ...prev,
      leaveType: "Sick Leave",
      fromDate: "",
      toDate: "",
      reason: "",
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* 🔥 ADD THIS LINE HERE */}
    <h1>{formData.employeeName}</h1>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Apply Leave Request
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >

        {/* Employee Name */}
        <input
          type="text"
          name="employeeName"
          placeholder="Employee Name"
          value={formData.employeeName}
          readOnly
          className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
        />

        {/* Employee ID */}
        <input
          type="text"
          name="employeeId"
          placeholder="Employee ID"
          value={formData.employeeId}
          readOnly
          className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
        />

        {/* Department */}
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          readOnly
          className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
        />

        {/* Leave Type */}
        <select
          name="leaveType"
          value={formData.leaveType}
          onChange={handleChange}
          className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
        >
          <option>Sick Leave</option>
          <option>Casual Leave</option>
          <option>Earned Leave</option>
          <option>Permission</option>
        </select>

        {/* From Date */}
        <input
          type="date"
          name="fromDate"
          value={formData.fromDate}
          onChange={handleChange}
          className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
          required
        />

        {/* To Date */}
        <input
          type="date"
          name="toDate"
          value={formData.toDate}
          onChange={handleChange}
          className="border border-gray-300 rounded-xl px-4 py-3 outline-none"
          required
        />

        {/* Reason */}
        <textarea
          name="reason"
          placeholder="Reason"
          value={formData.reason}
          onChange={handleChange}
          rows="4"
          className="md:col-span-2 border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none"
          required
        />

        {/* Submit */}
        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}