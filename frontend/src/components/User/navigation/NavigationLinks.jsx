// NavigationLinks.js
import { Home, FolderKanban, List, Plus } from 'lucide-react';

const userId = localStorage.getItem("user_id");
// console.log("userr navigation", userId)

export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: `/user/jobs/${userId}`, label: "Jobs", icon: FolderKanban },
  { path: "/reports", label: "Categories", icon: List, isModal: true },
  { path: "createpost", label: "Create Post", icon: Plus, isModal: true },
];
