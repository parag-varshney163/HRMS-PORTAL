import { LayoutDashboard, Users, CalendarOff, Clock, Wallet, FileSignature, Receipt, Megaphone, Banknote, ClipboardList, Files, Network, Settings, LogOut, UserMinus, UserPlus } from "lucide-react";


const MENU_ITEMS = [
  {
    name: "Dashboard",
    icon: LayoutDashboard, 
    path: "/dashboard",
    allowedRoles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Employees",
    icon: Users,
    path: "/employees",
    allowedRoles: ["admin", "hr"],
  },
  // {
  //   name: "Resignation",
  //   icon: UserMinus,
  //   path: "/resignations",
  //   allowedRoles: ["admin", "hr", "employee","manager"],
  // },
  {
    name: "Recruitment",
    icon: UserPlus,
    path: "/recruitment",
    allowedRoles: ["admin", "hr", "manager"],
  },
  {
    name: "Tasks",
    icon: ClipboardList,
    path: "/tasks",
    allowedRoles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Attendance",
    icon: Clock,     path: "/attendence",
    allowedRoles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Leaves",
    icon: CalendarOff, 
    path: "/leaves",
    allowedRoles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Finance",
    icon: Wallet, 
    path: "/finance",
    allowedRoles: ["admin", 'hr', "employee"], 
  },
  {
    name: "Reimbursements",
    icon: Receipt,
    path: "/reimbursements",
    allowedRoles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Payroll",
    icon: Banknote, 
    path: "/payroll",
    allowedRoles: ["admin", "hr"],
  },
  {
    name: "Documents",
    icon: Files,     path: "/documents",
    allowedRoles: ["admin", "hr", "manager", "employee"], 
  },
  {
    name: "Org Chart",
    icon: Network, 
    path: "/org-chart",
    allowedRoles: ["admin", "hr", "manager"],
  },
  {
    name: "Announcements",
    icon: Megaphone,
    path: "/announcements",
    allowedRoles: ["admin", "hr"], 
  },
  {
    name: "Offer Letters",
    icon: FileSignature,
    path: "/offer-letters",
    allowedRoles: ["admin", "hr", "manager"],
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
    allowedRoles: ["admin", "hr"],
  },
  {
    name: "Logout",
    icon: LogOut,
    path: "/logout",
    isLogout: true,
    allowedRoles: ["admin", "hr", "manager", "employee"],
  },
];

export default MENU_ITEMS;