import { Building2, Network, ShieldAlert, Bell, Loader2, CalendarDays, Palmtree, } from "lucide-react";
import React, { useState, Suspense, lazy } from "react";


// LAZY LOADING: Only loads the component file if the user clicks the tab
const CompanyProfile = lazy(
  () => import("../components/Settings/CompanyProfile"),
);
const DepartmentsManager = lazy(
  () => import("../components/Settings/DepartmentsManager"),
);
const Notifications = lazy(
  () => import("../components/Settings/Notifications"),
);

const HolidayManager = lazy(
  () => import("../components/Settings/HolidayManager"),
);
const LeavePolicy = lazy(() => import("../components/Settings/LeavePolicy"));
const SETTINGS_TABS = [
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "company", label: "Company Profile", icon: Building2 },
  { id: "departments", label: "Departments", icon: Network },
  { id: "leave-policy", label: "Leave Policy", icon: CalendarDays },
  // { id: "security", label: "Security & Roles", icon: ShieldAlert },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div className="py-2 pb-6 w-full min-h-screen flex flex-col gap-6">
      {/* TOP TAB NAVIGATION */}
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            System <span className="text-accent">Settings</span>
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage your organization preferences.
          </p>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-btn text-white shadow-md shadow-btn/20"
                    : "bg-input border border-card-border text-text-secondary hover:text-text-primary hover:bg-hover"
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? "text-white" : "opacity-70"}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* CONTENT AREA WITH SUSPENSE FALLBACK */}
      <div className="flex-1 bg-card border border-card-border rounded-2xl p-4 sm:p-6 lg:p-8 h-full">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3 py-20">
              <Loader2 className="animate-spin text-accent" size={32} />
              <p className="text-sm font-medium">Loading module...</p>
            </div>
          }
        >
          {activeTab === "holidays" && <HolidayManager />}
          {activeTab === "company" && <CompanyProfile />}
          {activeTab === "departments" && <DepartmentsManager />}
          {activeTab === "leave-policy" && <LeavePolicy />}
          {activeTab === "notifications" && <Notifications />}
          {/* {activeTab === "security" && (
            <div className="py-20 text-center text-text-secondary border border-dashed border-card-border rounded-xl">
              Security & Roles module coming soon.
            </div>
          )} */}
        </Suspense>
      </div>
    </div>
  );
};

export default Settings;
