import { useEffect, useState } from "react";

export default function AdminPanel() {

  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
  });

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/attendance/admin-dashboard/")
      .then(res => res.json())
      .then(data => {

        console.log("🔥 ATTENDANCE DATA:", data);

        if (!Array.isArray(data)) {
          console.log("❌ Not array:", data);
          return;
        }

        let present = 0;

        data.forEach(emp => {
          const status = (emp.today_status || "")
            .toString()
            .trim()
            .toLowerCase();

          console.log("STATUS:", status);

          if (status === "present") {
            present++;
          }
        });

        console.log("✅ FINAL PRESENT:", present);

        setSummary({
          total: data.length,
          present: present,
          absent: data.length - present
        });

      })
      .catch(err => console.log("ERROR:", err));

  }, []);

  return (
    <div>
      <h2>Total: {summary.total}</h2>
      <h2>Present: {summary.present}</h2>
      <h2>Absent: {summary.absent}</h2>
    </div>
  );
}