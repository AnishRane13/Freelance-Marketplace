import { Home, FolderKanban, List, Plus } from 'lucide-react';

export const navLinks = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/projects", label: "Jobs", icon: FolderKanban },
  { path: "/categories", label: "Categories", icon: List, isModal: true },
  { path: "createjob", label: "Create Job", icon: Plus, isModal: true },
];
