import type { Database } from "@/integrations/supabase/types";

type Player = Database["public"]["Tables"]["players"]["Row"];

export const exportPlayersToCSV = (players: Player[], filename: string = "players.csv") => {
  const headers = [
    "First Name",
    "Last Name",
    "Date of Birth",
    "Age",
    "Gender",
    "Division",
    "Program",
    "Parent/Guardian",
    "Email",
    "Phone",
    "Address",
    "City",
    "State",
    "Zip",
    "Status",
    "Payment Status",
    "Amount Due",
    "Amount Paid",
    "Jersey Size",
    "Skill Level",
    "Medical Notes",
    "Registration Date",
  ];

  const rows = players.map((player) => [
    player.first_name,
    player.last_name,
    player.date_of_birth,
    player.age_at_registration || "",
    player.gender || "",
    "", // Division - will need to join
    "", // Program - will need to join
    player.parent_guardian_name,
    player.parent_email,
    player.parent_phone,
    player.address_line1 || "",
    player.city || "",
    player.state || "",
    player.zip_code || "",
    player.status,
    player.payment_status,
    player.amount_due || "",
    player.amount_paid || "",
    player.jersey_size || "",
    player.skill_level || "",
    player.medical_notes || "",
    player.registration_date,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportForGameChanger = (players: Player[], teamName: string = "team") => {
  const headers = ["First Name", "Last Name", "Jersey Number", "Date of Birth"];

  const rows = players.map((player) => [
    player.first_name,
    player.last_name,
    player.jersey_number || "",
    player.date_of_birth,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${teamName}_gamechanger.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generic CSV export function
export const exportToCSV = (data: any[], filename: string = "export.csv") => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => row[header] || "")
  );

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
