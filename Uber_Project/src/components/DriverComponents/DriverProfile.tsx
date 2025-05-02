import DriverPageBreadcrumb from "../common/DriverPageBreadCrumb";
import DriverInfoCard from "./DriverInfoCard";
// import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../common/PageMeta";

export default function DriverProfile() {
  return (
    <>
      <PageMeta
        title="React.js Driver Profile Dashboard"
        description="This is React.js Driver Profile Dashboard"
      />
      <DriverPageBreadcrumb pageTitle="Driver Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <DriverInfoCard />
          {/* <UserAddressCard /> */}
        </div>
      </div>
    </>
  );
}
