import { useEffect, useState } from "react";

const CandidateTable = () => {
  const [candidates, setCandidates] = useState([]);

  // 🔥 GET METHOD HERE
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log("USER ID:", userId);

    const isAdmin = localStorage.getItem("isAdmin");

    const url =
      isAdmin === "true"
        ? "http://127.0.0.1:8000/api/app1/employees/"
        : `http://127.0.0.1:8000/api/app1/employees/?user_id=${userId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("API DATA:", data);
        setCandidates(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white rounded shadow p-4 overflow-x-auto">

      {/* Header */}
      <div className="grid grid-cols-10 gap-6 min-w-[1200px] font-semibold text-sm border-b pb-3">
        <div className="px-3 whitespace-nowrap">Emp ID</div>
        <div className="px-3 whitespace-nowrap">Name</div>
        <div className="px-3 whitespace-nowrap">Email</div>
        <div className="px-3 whitespace-nowrap">Phone</div>
        <div className="px-3 whitespace-nowrap">Department</div>
        <div className="px-3 whitespace-nowrap">Joining Date</div>
        <div className="px-3 whitespace-nowrap">Role</div>
        <div className="px-3 whitespace-nowrap">Aadhaar</div>
        <div className="px-3 whitespace-nowrap">PAN</div>
        <div className="px-3 whitespace-nowrap">City</div>
      </div>

      {/* Data */}
      {candidates && candidates.length > 0 ? (
        candidates.map((c, index) => (
          <div
            key={index}
            className="grid grid-cols-10 gap-6 min-w-[1200px] text-sm border-b py-3 hover:bg-gray-50"
          >
            <div className="px-3 whitespace-nowrap">{c.employee_id}</div>
            <div className="px-3 whitespace-nowrap">{c.name}</div>
            <div className="px-3 whitespace-nowrap">
              {c.email}
            </div>
            <div className="px-3 whitespace-nowrap">{c.phone}</div>
            <div className="px-3 whitespace-nowrap">{c.department}</div>
            <div className="px-3 whitespace-nowrap">{c.date_of_joining}</div>
            <div className="px-3 whitespace-nowrap">{c.role}</div>
            <div className="px-3 whitespace-nowrap">{c.aadhaar}</div>
            <div className="px-3 whitespace-nowrap">{c.pan}</div>
            <div className="px-3 whitespace-nowrap">{c.city}</div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-lg">No records found</p>
        </div>
      )}
    </div>
  );
};

export default CandidateTable;