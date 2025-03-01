import { Home, FolderKanban, BarChart3, FileText, Plus } from 'lucide-react';

export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/projects", label: "Jobs", icon: FolderKanban },
  // { path: "/analytics", label: "Previous Work", icon: BarChart3 },
  // { path: "/reports", label: "Reports", icon: FileText },
  { path: "/reports", label: "Categories", icon: FileText },
  { path: "/reports", label: "Create Post", icon: Plus },
];