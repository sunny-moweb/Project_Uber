import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DriverList from "../../components/tables/BasicTables/DriversList";

export default function BasicTables() {
  return (
    <>
      <div className="space-y-6">
        <ComponentCard title="">
          <DriverList />
        </ComponentCard>
      </div>
    </>
  );
}
