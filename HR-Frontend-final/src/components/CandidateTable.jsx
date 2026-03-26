
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
        console.log("API DATA:", data); // debug
        setCandidates(data); // important
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white rounded shadow p-4">

      {/* Header */}
      {/* <div className="grid grid-cols-10 font-semibold text-sm border-b pb-2">
        <div>First Name</div>
        <div>Last Name</div>
        <div>Email ID</div>
        <div>Official Email</div>
        <div>Status</div>
        <div>Department</div>
        <div>Source of Hire</div>
        <div>UAN Number</div>
        <div>PAN Card</div>
        <div>Aadhaar</div>
      </div> */}
      <div className="grid grid-cols-10 font-semibold text-sm border-b pb-2">
  <div>Emp ID</div>
  <div>Name</div>
  <div>Email</div>
  <div>Phone</div>
  <div>Department</div>
  <div>Joining Date</div>
  <div>Role</div>
  <div>Aadhaar</div>
  <div>PAN</div>
  <div>City</div>
</div>

      {/* Data */}
      {candidates && candidates.length > 0 ? (
        candidates.map((c, index) => (
          <div
            key={index}
            className="grid grid-cols-10 text-sm border-b py-2"
          >
           <div>{c.employee_id}</div>
<div>{c.name}</div>
<div>{c.email}</div>
<div>{c.phone}</div>
<div>{c.department}</div>
<div>{c.date_of_joining}</div>
<div>{c.role}</div>
<div>{c.aadhaar}</div>
<div>{c.pan}</div>
<div>{c.city}</div>
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


