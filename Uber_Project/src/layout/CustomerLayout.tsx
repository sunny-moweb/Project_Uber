import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router-dom";
import Backdrop from "./Backdrop";
import CustomerHeader from "./CustomerHeader";

const LayoutContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Backdrop />
      <CustomerHeader />

      {/* Centered Page Content */}
      <div className="w-full px-4 md:px-6 py-4 flex justify-center">
        <div className="w-full max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const CustomerLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default CustomerLayout;
