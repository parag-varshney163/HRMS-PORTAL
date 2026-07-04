import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import React, { lazy, Suspense, useState } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Sidebar from "./components/ui/Sidebar";
// import Navbar from "./components/ui/Navbar";
// // ─── Lazy-loaded pages (code-split per route) ─────────────────────
// const Dashboard = lazy(() => import("./pages/Dashboard"));
// const Employees = lazy(() => import("./pages/Employees"));
// const Tasks = lazy(() => import("./pages/Tasks"));
// const Leaves = lazy(() => import("./pages/Leaves"));
// const Finance = lazy(() => import("./pages/Finance"));
// const Reimbursements = lazy(() => import("./pages/Reimbursements"));
// const Payroll = lazy(() => import("./pages/Payroll"));
// const Attendence = lazy(() => import("./pages/Attendence"));
// const Documents = lazy(() => import("./pages/Documents"));
// const OrgChart = lazy(() => import("./pages/OrgChart"));
// const Settings = lazy(() => import("./pages/Settings"));
// const Resignations = lazy(() => import("./pages/Resignations"));
// const Recruitment = lazy(() => import("./pages/Recruitment"));
// const PageLoader = () => (
//   <div className="flex-1 flex items-center justify-center py-32">
//     <div className="flex flex-col items-center gap-3">
//       <div className="w-8 h-8 border-3 border-btn border-t-transparent rounded-full animate-spin" />
//       <span className="text-sm text-text-secondary">Loading...</span>
//     </div>
//   </div>
// );
// // ─── Shared layout — Sidebar + Navbar wrapping page content ───────
// // const AppLayout = ({ children }) => {
// //   const [sidebarOpen, setSidebarOpen] = useState(true);
// //   return (
// //     <div className="min-h-screen flex bg-gradient-to-b from-primary to-secondary text-text-primary">
// //       <Sidebar
// //         isOpen={sidebarOpen}
// //         toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
// //       />
// //       <main className="flex-1 py-6 px-8 overflow-y-auto">
// //         <Navbar />
// //         <Suspense fallback={<PageLoader />}>{children}</Suspense>
// //       </main>
// //     </div>
// //   );
// // };
// const AppLayout = ({ children }) => {
//   // Start closed on mobile, open on desktop
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };
//   return (
//     <div className="h-screen flex bg-linear-to-b from-primary to-secondary text-text-primary overflow-hidden">
//       <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
//       <main className="flex-1 py-4 px-4 md:py-6 md:px-8 overflow-y-auto no-scrollbar">
//         <Navbar toggleSidebar={toggleSidebar} />
//         <Suspense fallback={<PageLoader />}>{children}</Suspense>
//       </main>
//     </div>
//   );
// };
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* All HRMS routes share the same shell layout */}
//         <Route
//           path="/"
//           element={
//             <AppLayout>
//               <Dashboard />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/login"
//           element={
//             <AppLayout>
//               <Dashboard />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/dashboard"
//           element={
//             <AppLayout>
//               <Dashboard />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/employees"
//           element={
//             <AppLayout>
//               <Employees />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/employees/resignations"
//           element={
//             <AppLayout>
//               <Resignations />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/recruitment"
//           element={
//             <AppLayout>
//               <Recruitment />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/tasks"
//           element={
//             <AppLayout>
//               <Tasks />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/leaves"
//           element={
//             <AppLayout>
//               <Leaves />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/finance"
//           element={
//             <AppLayout>
//               <Finance />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/reimbursements"
//           element={
//             <AppLayout>
//               <Reimbursements />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/payroll"
//           element={
//             <AppLayout>
//               <Payroll />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/attendence"
//           element={
//             <AppLayout>
//               <Attendence />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/documents"
//           element={
//             <AppLayout>
//               <Documents />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/org-chart"
//           element={
//             <AppLayout>
//               <OrgChart />
//             </AppLayout>
//           }
//         />
//         <Route
//           path="/settings"
//           element={
//             <AppLayout>
//               <Settings />
//             </AppLayout>
//           }
//         />
//         {/* Catch-all — redirect to dashboard */}
//         <Route path="*" element={<Dashboard />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
// export default App;
import React, { lazy, Suspense, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./components/ui/Sidebar";
import Sonner from "./components/ui/Sonner";
import Navbar from "./components/ui/Navbar";


// ─── Loading Spinner ───
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center py-32">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-btn border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-text-secondary">Loading...</span>
    </div>
  </div>
);

import useSessionManager from "./hooks/useSessionManager";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  // Activate session management (idle timeout + tab-close grace)
  useSessionManager();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    // <div className="h-screen flex bg-linear-to-b from-primary to-secondary text-text-primary overflow-hidden">
    <div
      className="h-screen flex overflow-hidden"
      style={{
        background: colors.pageGradient,
        color: colors.textPrimary,
      }}
    >
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main className="flex-1 py-4 px-4 md:py-6 md:px-8 overflow-y-auto relative">
        <Navbar toggleSidebar={toggleSidebar} />
        {/* Outlet renders the matched child route (Dashboard, Employees, etc.) */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {/* Professional HRMS Toast Notifications */}
      <Sonner />
    </div>
  );
};

import ProtectedRoute from "./routes/ProtectedRoutes";
import PublicRoute from "./routes/PublicRoutes";
import ROUTES from "./constants/Routes";
import AnnouncementsPage from "./pages/Announcements";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import colors from "./constants/colors";
import AuditLogs from "./pages/AuditLogs";

// ─── Lazy-loaded Public Pages ───
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));

// ─── Lazy-loaded Protected Pages ───
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const Resignations = lazy(() => import("./pages/Resignations"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Leaves = lazy(() => import("./pages/Leaves"));
const Finance = lazy(() => import("./pages/Finance"));
const Reimbursements = lazy(() => import("./pages/Reimbursements"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Attendence = lazy(() => import("./pages/Attendence"));
const Documents = lazy(() => import("./pages/Documents"));
const OrgChart = lazy(() => import("./pages/OrgChart"));
const Settings = lazy(() => import("./pages/Settings"));
const OfferLetters = lazy(() => import("./pages/OfferLetters"));

function App() {
  return (
    <BrowserRouter>
      {/* Global toaster for public routes (login, reset, etc.) */}
      <Sonner />
      <Routes>
        {/* ─── PUBLIC ROUTES (No Layout) ─── */}
        <Route
          path={ROUTES.ROOT}
          element={
            <PublicRoute>
              <WelcomePage />
            </PublicRoute>
          }
        />
        <Route
          path={ROUTES.LOGIN}
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* ─── RESET / UPDATE PASSWORD (Public, No Layout) ─── */}
        <Route
          path={ROUTES.RESET_PASSWORD}
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route path={ROUTES.UPDATE_PASSWORD} element={<UpdatePassword />} />

        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

        {/* ─── PROTECTED ROUTES (Wrapped in AppLayout) ─── */}
        <Route element={<AppLayout />}>
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="report"
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.EMPLOYEES}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="moderationPanel"
              >
                <Employees />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.RESIGNATIONS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="moderationPanel"
              >
                <Resignations />
              </ProtectedRoute>
            }
          />

          {/* Note: I added Recruitment here assuming it maps to moderationPanel based on your menu */}
          <Route
            path="/recruitment"
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="moderationPanel"
              >
                <Recruitment />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.TASKS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="activityLog"
              >
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.OFFER_LETTERS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="flagged"
              >
                <OfferLetters />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.LEAVE_MANAGEMENT}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="flagged"
              >
                <Leaves />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.FINANCE}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="qualityReview"
              >
                <Finance />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.REIMBURSEMENTS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="creatorScores"
              >
                <Reimbursements />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.PAYROLL}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="customerSupport"
              >
                <Payroll />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.ATTENDENCE}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="chatbotTemplate"
              >
                <Attendence />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.DOCUMENTS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="accountManagement"
              >
                <Documents />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.ORG_CHART}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="insightsAndMetrics"
              >
                <OrgChart />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="moderationPanel"
              >
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ANNOUNCEMENTS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="moderationPanel"
              >
                <AnnouncementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.AUDIT_LOGS}
            element={
              <ProtectedRoute
                section="moderationDashboard"
                permissionKey="moderationPanel"
              >
                <AuditLogs />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ─── CATCH-ALL ROUTE ─── */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
