import { Navigate } from "react-router-dom";
import React from "react";
import ROUTES from "../constants/Routes";
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to={ROUTES.LOGIN} replace />;
};
export default ProtectedRoute;

// import { Navigate } from "react-router-dom";
// import { useEffect } from "react";
// // import React from "react";

// import usePermissions from "../hooks/usePermissions";
// import axiosInstance from "../api/axiosInstance";
// import ROUTES from "../constants/Routes";

// const ProtectedRoute = ({ children, section, permissionKey }) => {
//   const token = localStorage.getItem("token");

//   const isValid =
//     token && token !== "undefined" && token !== "null" && token.trim() !== "";

//   if (!isValid) return <Navigate to={ROUTES.LOGIN} replace />;

//   useEffect(() => {
//     const interval = setInterval(async () => {
//       try {
//         // const res = await axiosInstance.get("/api/v1/user/check-session");
//         const isActive = res?.data?.data?.active;

//         if (!isActive) {
//           localStorage.clear();
//           window.location.href = ROUTES.LOGIN;
//         }
//       } catch {
//         localStorage.clear();
//         window.location.href = ROUTES.LOGIN;
//       }
//     }, 40000);

//     return () => clearInterval(interval);
//   }, []);

//   const { permissions, loading, canAccess } = usePermissions();

//   // WAIT UNTIL fully loaded
//   if (loading)
//     return (
//       <div className="text-white p-4">
//         Setting up the Enviornment for you...
//       </div>
//     );

//   // DO NOT redirect. Just wait.
//   if (!permissions) {
//     return <div className="text-white p-4">Validating access...</div>;
//   }

//   if (section && permissionKey) {
//     const allowed = canAccess(section, permissionKey);

//     if (!allowed) {
//       localStorage.clear();
//       return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
//     }
//   }

//   return children;
// };

// export default ProtectedRoute;
