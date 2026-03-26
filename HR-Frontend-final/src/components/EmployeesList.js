import { useEffect, useState } from "react";

export default function EmployeesList() {

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/app1/employees/")
      .then(res => res.json())
      .then(data => {
        console.log("EMP:", data);
        setEmployees(data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4 mt-6">

      <h2 className="text-lg font-bold mb-4">
        Employees
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          {/* 🔹 HEADER (SAME STYLE AS CANDIDATE) */}
          <thead>
            <tr className="grid grid-cols-7 font-semibold text-sm border-b pb-2">
                <div>Employee Id</div>
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Password</div>
              <div>Department</div>
              <div>Role</div>
              <div>Date of Joining</div>
              <div>Status</div>
            </tr>
          </thead>

          {/* 🔹 BODY */}
          <tbody>

            {employees.length === 0 ? (
              <tr>
                <td className="text-center py-4 text-gray-400">
                  No Employees
                </td>
              </tr>
            ) : (

              employees.map((item) => (

                <tr key={item.id} className="grid grid-cols-8 py-2 border-b">

  <div className="font-bold text-blue-600">
    {item.employee_id}
  </div>

  <div>{item.name}</div>

  <div>{item.email}</div>
    <div>{item.password}</div>

  <div>{item.phone || "-"}</div>

  <div>{item.department || "-"}</div>

  <div>{item.role || "-"}</div>

  <div>{item.date_of_joining || "-"}</div>

  <div className="text-green-600 font-medium">
    Active
  </div>

</tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}