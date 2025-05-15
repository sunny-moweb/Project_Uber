import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../components/auth/axiosInstance";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";

interface Vehicle {
  id: number;
  vehicle_number: string | number;
  vehicle_type: string;
  vehicle_front_image?: string;
  selected?: boolean;
}

const SelectVehicle = () => {

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  //! API for vehicle-selection-list-------------------------------->
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await API.get("/driverVehiclesListView");
        console.log(response, "response")
        const vehicleList = response.data.data.data;
        console.log(vehicleList, "vehicleghtrgv");
        
        setVehicles(vehicleList);
        
        // Find the vehicle which has `selected: true`
        const selectedVehicle = vehicleList.find((vehicle: Vehicle) => vehicle.selected);
        // const selectedVehicle = vehicleList.find(((v: Vehicle)) => v.selected);
        if (selectedVehicle) {
          setSelectedVehicleId(selectedVehicle.id);
        }
      } catch (error) {
        toast.error("Failed to fetch vehicles.");
        console.error("Error fetching vehicle list:", error);
      }
    };
    fetchVehicles();
  }, []);

  //* API for vehicle-selection----------------------->
  const handleVehicleSelect = async (id: number) => {
    setSelectedVehicleId(id);
    try {
      await API.patch("/selectVehicleView", { vehicle_id: id });
      toast.success("Vehicle selected successfully!");
    } catch (error) {
      toast.error("Failed to select vehicle.");
      console.error("Error selecting vehicle:", error);
    }
  };

  return (
    <>
      <PageMeta
        title="React.js Driver vehicle select Dashboard"
        description="This is React.js Driver vehicle select Dashboard"
      />
      <PageBreadcrumb pageTitle="Driver Select Vehicle" />
      <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar />
      <div className="p-6">
        {Array.isArray(vehicles) && vehicles.map((vehicle) => (
          <label
            key={vehicle.id}
            className={`bg-white shadow rounded-lg p-6 mb-4 border-2 flex items-center gap-6 cursor-pointer transition-all ${selectedVehicleId === vehicle.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
          >
            <input
              type="radio"
              name="vehicle"
              value={vehicle.id}
              checked={selectedVehicleId === vehicle.id}
              onChange={() => handleVehicleSelect(vehicle.id)}
              className="accent-blue-500 w-5 h-5"
            />

            {vehicle.vehicle_front_image ? (
              <img
                src={vehicle.vehicle_front_image}
                alt="Vehicle"
                className="w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <div>
              <p className="text-gray-800 font-semibold">
                Vehicle Number:{" "}
                <span className="text-blue-600">{vehicle.vehicle_number}</span>
              </p>
              <p className="text-gray-700">
                Vehicle Type:{" "}
                <span className="text-green-600">{vehicle.vehicle_type}</span>
              </p>
            </div>
          </label>
        ))}
      </div>
    </>
  )
}

export default SelectVehicle
