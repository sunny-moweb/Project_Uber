import { Navigate, Outlet } from "react-router-dom";

interface CustomerRoute {
  allowedRoles: string[];
}
const CustomerRoute = ({allowedRoles}:CustomerRoute) => {
  const isAuthenticated = !!localStorage.getItem("access_token");
//   const isAuthenticated1 = !!localStorage.getItem("impersonation_access_token");

  const userRole = localStorage.getItem("user_role");
//   const userRole1 = localStorage.getItem("impersonation_role");

  const isAuthorized = (isAuthenticated && userRole && allowedRoles.includes(userRole));
  
  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to="/customer/login" />
  );
};

export default CustomerRoute;