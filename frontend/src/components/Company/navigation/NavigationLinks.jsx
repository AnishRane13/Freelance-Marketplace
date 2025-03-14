import { Home, FolderKanban, List, Plus } from "lucide-react";

const userId = localStorage.getItem("user_id");

export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: `/company/jobs/${userId}`, label: "Jobs", icon: FolderKanban },
  { path: "/categories", label: "Categories", icon: List, isModal: true }, // Only Categories has isModal
  { path: "/company/createjob", label: "Create Job", icon: Plus }, // Remove isModal here
];
