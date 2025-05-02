import DriverPageBreadcrumb from "../common/DriverPageBreadCrumb";
// import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../common/PageMeta";
import CustomerInfoCard from "./CustomerInfoCard";

export default function CustomerProfile() {
  return (
    <>
      <PageMeta
        title="React.js Customer Profile Dashboard"
        description="This is React.js Customer Profile Dashboard"
      />
      <DriverPageBreadcrumb pageTitle="Customer Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <CustomerInfoCard />
          {/* <UserAddressCard /> */}
        </div>
      </div>
    </>
  );
}
