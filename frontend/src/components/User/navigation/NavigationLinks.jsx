// NavigationLinks.js
import { Home, FolderKanban, BarChart3, FileText, Plus } from 'lucide-react';

export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/projects", label: "Jobs", icon: FolderKanban },
  { path: "/reports", label: "Categories", icon: FileText },
  { path: "createpost", label: "Create Post", icon: Plus, isModal: true },
];