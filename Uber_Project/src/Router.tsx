import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";          // Admin layout
import DriverLayout from "./layout/DriverLayout";    // Driver layout
import CustomerLayout from "./layout/CustomerLayout"; //Customer layout

import PrivateRoute from "./components/common/PrivateRoute";  // For admin
import DriverRoute from "./components/common/DriverRoute";    // For driver

// Admin Pages--------------------------------------------------------------------
import Home from "./pages/Dashboard/Home";
import BasicTables from "./pages/Tables/BasicTables";
import DriverRequests from "./components/tables/BasicTables/DriverRequests";
import DriverDetailsView from "./pages/AuthPages/DriverDetails";
import DraftDrivers from "./components/tables/BasicTables/DraftDrivers";
import PaymentHistory from "./components/tables/BasicTables/PaymentHistory";
// ... other admin imports


// Driver Pages--------------------------------------------------------------------
import DriverInfo from "./pages/AuthPages/DriverInfo";
import DriverHome from "./pages/DriverDashboard/DriverHome";
import VehicleInfo from "./components/DriverComponents/VehicleInfo";
import RideRequest from "./components/DriverComponents/RideRequest";
import DriverProfile from "./components/DriverComponents/DriverProfile";
import DriverRideStatus from "./components/DriverComponents/DriverRideStatus";

// Customer Pages--------------------------------------------------------------------
import CustomerHome from "./pages/CustomerDashboard/CustomerHome";
import CustomerProfile from "./components/CustomerComponents/CustomerProfile";
import RideStatus from "./components/CustomerComponents/RideStatus";
import RideHistory from "./components/CustomerComponents/RideHistory";
import TripInfo from "./components/CustomerComponents/TripInfo";


// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import DriverLogin from "./pages/AuthPages/DriverLogin";
import DriverSignUp from "./pages/AuthPages/DriverSignUp";
import CustomerLogin from "./pages/AuthPages/CustomerLogin";
import CustomerSignup from "./pages/AuthPages/CustomerSignup";

// Others
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Calendar from "./pages/Calendar";
import Blank from "./pages/Blank";
import FormElements from "./pages/Forms/FormElements";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import ForgotPassword from "./components/auth/ForgotPassword";
import ForgotPasswordLink from "./components/auth/ForgotPasswordLink";
import VehicleRequests from "./pages/AuthPages/VehicleRequests";
import VehicleRequestsView from "./pages/AuthPages/VehicleRequestsView";
import VehicleList from "./components/DriverComponents/VehicleList";
import DraftVehicle from "./components/DriverComponents/DraftVehicle";
import AddTeamMember from "./pages/AuthPages/AddTeamMember";
import TeamMemberList from "./pages/AuthPages/TeamMemberList";
import SelectVehicle from "./components/DriverComponents/SelectVehicle";
import CustomerRoute from "./components/common/CutomerRoute";


export default function Router() {
    return (
        <Routes>
            {/* ADMIN ROUTES with AppLayout */}
            <Route path="/" element={<Navigate to="/admin/signin" replace />} />
            <Route path="/admin/signin" element={<SignIn />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/forgot-password-link/:verification_code" element={<ForgotPasswordLink />} />


            <Route element={<AppLayout />}>
                {/* Protected Admin Routes */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/driver-list" element={<BasicTables />} />
                    <Route path="/driver-request-details" element={<DriverRequests />} />
                    <Route path="/driver-request-details/:id" element={<DriverDetailsView />} />
                    <Route path="/driver-details/:id" element={<DriverDetailsView />} />
                    <Route path="/draft-drivers" element={<DraftDrivers />} />
                    <Route path="/vehicle-request" element={<VehicleRequests />} />
                    <Route path="/vehicle-request-view/:id" element={<VehicleRequestsView />} />
                    <Route path="/vehicle-list" element={<VehicleList />} />
                    <Route path="/draft-vehicles" element={<DraftVehicle />} />
                    <Route path="/add-team-member" element={<AddTeamMember />} />
                    <Route path="/team-member" element={<TeamMemberList />} />
                    {/* ...other admin protected routes */}
                </Route>

                {/* Admin Public Routes */}
                {/* Payments */}
                <Route path="/payment-history" element={<PaymentHistory />} />
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />
                <Route path="/form-elements" element={<FormElements />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* DRIVER ROUTES */}
            {/* Driver Public Routes */}
            <Route path="/driver/login" element={<DriverLogin />} />
            <Route path="/driver/signup" element={<DriverSignUp />} />
            <Route path="/driver-info" element={<DriverInfo />} />

            {/* DRIVER ROUTES with DriverLayout */}
            <Route element={<DriverLayout />}>
                {/* Protected Driver Routes */}
                <Route element={<DriverRoute allowedRoles={['driver']} />}>
                    <Route path="/driver/home" element={<DriverHome />} />
                    <Route path="/vehicle-details" element={<VehicleInfo />} />
                    <Route path="/select-vehicle" element={<SelectVehicle />} />
                    <Route path="/ride-request" element={<RideRequest />} />
                    <Route path="/driver/profile" element={<DriverProfile />} />
                    <Route path="/driver-ride-status" element={<DriverRideStatus />} />
                </Route>
            </Route>

            {/* Cutomer ROUTES */}
            {/* Customer Public Routes */}
            <Route path="/customer/login" element={<CustomerLogin />} />
            <Route path="/customer/signup" element={<CustomerSignup />} />
            {/* <Route path="/driver-info" element={<DriverInfo />} /> */}

            {/* Customer Route with CustomerLayout */}
            <Route element={<CustomerLayout/>}>
                <Route element={<CustomerRoute allowedRoles={['customer']}/>}>
                    <Route path="/customer/home" element={<CustomerHome/>}/>
                    <Route path="/customer/profile" element={<CustomerProfile />} />
                    <Route path="/ride-status" element={<RideStatus />} />
                    <Route path="/my-rides" element={<RideHistory />} />
                    <Route path="/trip-details/:id" element={<TripInfo />} />
                </Route>
            </Route>

            {/* Default Route or Redirect */}

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
