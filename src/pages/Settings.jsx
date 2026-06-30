import { Building2, Network, ShieldAlert, Bell, Loader2, CalendarDays, Palmtree, } from "lucide-react";
import React, { useState, Suspense, lazy } from "react";

import colors from "../constants/colors";


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

  // return (
  //   <div className="py-2 pb-6 w-full min-h-screen flex flex-col gap-6">
  //     {/* TOP TAB NAVIGATION */}
  //     <div className="w-full">
  //       <div className="mb-6">
  //         <h2 className="text-2xl font-bold text-text-primary">
  //           System <span className="text-accent">Settings</span>
  //         </h2>
  //         <p className="text-sm text-text-secondary mt-1">
  //           Manage your organization preferences.
  //         </p>
  //       </div>

  //       <nav className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
  //         {SETTINGS_TABS.map((tab) => {
  //           const Icon = tab.icon;
  //           const isActive = activeTab === tab.id;
  //           return (
  //             <button
  //               key={tab.id}
  //               onClick={() => setActiveTab(tab.id)}
  //               className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
  //                 isActive
  //                   ? "bg-btn text-white shadow-md shadow-btn/20"
  //                   : "bg-input border border-card-border text-text-secondary hover:text-text-primary hover:bg-hover"
  //               }`}
  //             >
  //               <Icon
  //                 size={16}
  //                 className={isActive ? "text-white" : "opacity-70"}
  //               />
  //               {tab.label}
  //             </button>
  //           );
  //         })}
  //       </nav>
  //     </div>

  //     {/* CONTENT AREA WITH SUSPENSE FALLBACK */}
  //     <div className="flex-1 bg-card border border-card-border rounded-2xl p-4 sm:p-6 lg:p-8 h-full">
  //       <Suspense
  //         fallback={
  //           <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3 py-20">
  //             <Loader2 className="animate-spin text-accent" size={32} />
  //             <p className="text-sm font-medium">Loading module...</p>
  //           </div>
  //         }
  //       >
  //         {activeTab === "holidays" && <HolidayManager />}
  //         {activeTab === "company" && <CompanyProfile />}
  //         {activeTab === "departments" && <DepartmentsManager />}
  //         {activeTab === "leave-policy" && <LeavePolicy />}
  //         {activeTab === "notifications" && <Notifications />}
  //         {/* {activeTab === "security" && (
  //           <div className="py-20 text-center text-text-secondary border border-dashed border-card-border rounded-xl">
  //             Security & Roles module coming soon.
  //           </div>
  //         )} */}
  //       </Suspense>
  //     </div>
  //   </div>
  // );

return (
  <div
    className="py-2 pb-6 w-full min-h-screen flex flex-col gap-6"
    style={{
      background: colors.pageGradient,
    }}
  >
    {/* Header */}
    <div
      className="rounded-3xl border p-6"
      style={{
        background: `linear-gradient(135deg, ${colors.accentLight} 0%, ${colors.primary} 65%, ${colors.secondary} 100%)`,
        borderColor: colors.cardBorder,
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{
              background: colors.accent,
              color: colors.textPrimary,
            }}
          >
            <ShieldAlert size={14} />
            Administration
          </div>

          <h2
            className="text-3xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            System{" "}
            <span style={{ color: colors.accentDark }}>
              Settings
            </span>
          </h2>

          <p
            className="mt-2 max-w-2xl"
            style={{ color: colors.textSecondary }}
          >
            Configure company profile, departments, holidays, leave policies,
            and notification preferences from one place.
          </p>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div
      className="rounded-2xl p-2 shadow-sm"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <nav className="flex gap-2 overflow-x-auto custom-scrollbar">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300"
              style={{
                background: isActive
                  ? colors.buttonBg
                  : colors.inputBg,
                color: isActive
                  ? colors.textPrimary
                  : colors.textSecondary,
                border: `1px solid ${
                  isActive
                    ? colors.buttonBg
                    : colors.cardBorder
                }`,
                boxShadow: isActive
                  ? "0 8px 20px rgba(247,200,66,.25)"
                  : "none",
              }}
            >
              <Icon
                size={18}
                color={
                  isActive
                    ? colors.textPrimary
                    : colors.accentDark
                }
              />

              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>

    {/* Content */}
    <div
      className="flex-1 rounded-3xl overflow-hidden"
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
      }}
    >
      <Suspense
        fallback={
          <div
            className="flex flex-col items-center justify-center gap-4"
            style={{ height: "500px" }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: colors.accentLight,
              }}
            >
              <Loader2
                size={30}
                className="animate-spin"
                color={colors.accentDark}
              />
            </div>

            <div className="text-center">
              <h3
                className="font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Loading Settings
              </h3>

              <p
                className="text-sm mt-1"
                style={{ color: colors.textSecondary }}
              >
                Please wait while we prepare the module...
              </p>
            </div>
          </div>
        }
      >
        <div className="p-5 sm:p-6 lg:p-8">
          {activeTab === "holidays" && <HolidayManager />}
          {activeTab === "company" && <CompanyProfile />}
          {activeTab === "departments" && <DepartmentsManager />}
          {activeTab === "leave-policy" && <LeavePolicy />}
          {activeTab === "notifications" && <Notifications />}
        </div>
      </Suspense>
    </div>
  </div>
);
};

export default Settings;
