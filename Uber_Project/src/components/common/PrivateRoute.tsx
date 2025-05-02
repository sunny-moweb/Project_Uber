import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  allowedRoles: string[]; // e.g. ['admin'], ['driver'], etc.
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  const isAuthorized = isAuthenticated && userRole && allowedRoles.includes(userRole);

  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/signin" />
  );
};

export default PrivateRoute;
