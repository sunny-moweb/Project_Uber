import { Navigate, Outlet } from "react-router-dom";

interface DriverRouteProps {
  allowedRoles: string[];
}
const DriverRoute = ({allowedRoles}:DriverRouteProps) => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  const isAuthenticated1 = !!localStorage.getItem("impersonation_access_token");

  const userRole = localStorage.getItem("user_role");
  const userRole1 = localStorage.getItem("impersonation_role");

  const isAuthorized = (isAuthenticated && userRole && allowedRoles.includes(userRole)) || (isAuthenticated1 && userRole1 && allowedRoles.includes(userRole1));
  
  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to="/driver/login" />
  );
};

export default DriverRoute;