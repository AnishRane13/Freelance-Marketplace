// NavigationLinks.js
import { Home, FolderKanban, List, Plus } from 'lucide-react';

export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/projects", label: "Jobs", icon: FolderKanban },
  { path: "/reports", label: "Categories", icon: List, isModal: true },
  { path: "createpost", label: "Create Post", icon: Plus, isModal: true },
];
