import { Home, FolderKanban, BarChart3, FileText, Plus } from 'lucide-react';

export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  // { path: "/projects", label: "Projects", icon: FolderKanban },
  { path: "/analytics", label: "Categories", icon: BarChart3 },
  { path: "/reports", label: "Jobs", icon: FileText },
  { path: "/reports", label: "Create Job", icon: Plus },
];