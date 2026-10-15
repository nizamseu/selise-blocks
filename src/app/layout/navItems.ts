import { Boxes, ClipboardList, FolderTree, LayoutDashboard, Palette, Settings, Store, Users } from "lucide-react";

export const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/catalog", label: "Catalog", icon: Boxes },
  { href: "/app/categories", label: "Categories", icon: FolderTree },
  { href: "/app/orders", label: "Orders", icon: ClipboardList },
  { href: "/app/theme", label: "Theme Studio", icon: Palette },
  { href: "/app/staff", label: "Staff", icon: Users },
  { href: "/app/branding", label: "Branding", icon: Settings },
  { href: "/app/profile", label: "Profile", icon: Store }
] as const;
