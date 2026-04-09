import { Navigate } from "react-router-dom";
import React from "react";

import ROUTES from "../constants/Routes";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to={ROUTES.DASHBOARD} replace /> : children;
};

export default PublicRoute;
