import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useEffect, useState } from "react";
import API from "../auth/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLoader } from "../common/LoaderContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  gender: string | null;
  profile_pic: string | undefined;
}

export default function CustomerInfoCard() {

  //* modal for profile edit
  const { isOpen, openModal, closeModal } = useModal();
  //* modal for Reset password
  // const { isResetOpen, openResetModal, closeResetModal } = useModal();
  const {
    isOpen: isResetOpen,
    openModal: openResetModal,
    closeModal: closeResetModal,
  } = useModal();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  //* Reset-password
  const [resetFormData, setResetFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  //! Reset-password API
  const handleResetPassword = async () => {
    console.log("handleResetPassword triggered");
    const token = localStorage.getItem("access_token");

    const { current_password, new_password, confirm_password } = resetFormData;
    if (new_password !== confirm_password) {
      toast.error("New password and confirm password do not match");
      return;
    }
    try {
      showLoader();
      const response = await API.patch("/changePasswordView", {
        old_password: current_password,
        new_password,
        confirm_password,
      },
      );

      toast.success("Password changed successfully");
      console.log("Toaster-----------------");
      closeResetModal();
      if (response.status === 200) {
        setResetFormData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(
        error?.response?.data?.detail || "Failed to change password"
      );
    } finally {
      hideLoader();
    }
  };


  //* Loader
  const { showLoader, hideLoader } = useLoader();

  //* Profile data
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    gender: '',
    profile_pic: '',
  });

  //* API Modal-Data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    gender: "",
    profile_pic: "",
  });

  //! Modal Data display API
  const fetchProfileData = async () => {
    try {
      const response = await API.get('/updateProfileView');
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleOpenModal = () => {
    openModal();
    fetchProfileData();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
  };

  //! image-change function for modal
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Get the selected file
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_pic_file: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_pic: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  


  //! API for update Profile
  const handleSave = async () => {
    try {
      showLoader();
      console.log("FormData before sending:", formData);
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        gender: formData.gender,
        profile_pic: formData.profile_pic,
      };
      // console.log("Payload being sent to API:", payload);

      const response = await API.patch('/updateProfileView', payload);
      console.log("Updated Profile:", response.data);
      setTimeout(() => {
        toast.success("Profile updated successfully!");
        closeModal();
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      hideLoader();
    }
  };


  //! Api for getting profile-info
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    API.get('/ProfileView')
      .then(res => {
        setProfile(res.data);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
      });
  }, []);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-black-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.first_name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-black-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.last_name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-black-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.email}
              </p>
            </div><br />

            <div>
              <p className="mb-2 text-xs leading-normal text-black-500 dark:text-gray-400">
                Mobile Number
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.mobile_number}
              </p>
            </div><br />

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Gender
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile.gender}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 lg:flex-row justify-end">
          {/* Update-profile button */}
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" // Your icon path here
                fill=""
              />
            </svg>
            Edit
          </button>
          {/* Reset-password button */}
          <button
            onClick={openResetModal}
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z" // Your icon path here
                fill=""
              />
            </svg>
            Reset Password
          </button>
        </div>
      </div>

      {/* Edit-Profile Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] m-4">
        <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white p-4 dark:bg-gray-900">
          <div className="px-2 pr-10">
            <h4 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile Information
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Update your profile details
            </p>
          </div>

          <form className="flex flex-col">
            <div className="custom-scrollbar max-h-[300px] overflow-y-auto px-2 pb-3">
              {/* Personal Information */}
              <div>
                <h5 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                  Personal Information
                </h5>

                {/* Profile Image Section - Centered */}
                <div className="flex flex-col items-center mb-6">
                  <label htmlFor="profile-pic-upload" className="cursor-pointer group">
                    <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 text-lg font-medium text-blue-500 group-hover:ring-2 group-hover:ring-blue-400">
                      {formData.profile_pic ? (
                        <img
                          src={formData.profile_pic} // Base64 preview
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(formData.first_name, formData.last_name) // Show initials if no image
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block text-center group-hover:underline">
                      Change Photo
                    </span>
                  </label>
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </div>


                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 lg:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      type="text"
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Gender</Label>
                    <select
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      value={formData.gender || ''}
                      onChange={(e) => {
                        const newGender = e.target.value;
                        console.log("Selected gender:", newGender);
                        setFormData({ ...formData, gender: newGender });
                      }}
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-2 mt-4">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <button type="button" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Reset-Password Modal */}
      <Modal isOpen={isResetOpen} onClose={closeResetModal} className="max-w-[600px] m-4">
        <div className="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-2xl bg-white p-4 dark:bg-gray-900">
          <div className="px-2 pr-10">
            <h4 className="mb-2 text-xl text-center font-semibold text-gray-800 dark:text-white/90">
              ---Reset Password---
            </h4>
          </div>
          <form className="flex flex-col">
            <div className="mt-5 custom-scrollbar max-h-[300px] overflow-y-auto px-2 pb-3">
              <div className="flex flex-col gap-5">
                {/* Old Password */}
                <div className="relative">
                  <Label>Old Password</Label>
                  <Input
                    type={showOldPassword ? "text" : "password"}
                    value={resetFormData.current_password}
                    onChange={(e) =>
                      setResetFormData({ ...resetFormData, current_password: e.target.value })
                    }
                    className="pr-10"
                  />
                  <span
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute top-9 right-3 cursor-pointer"
                  >
                    {showOldPassword ? (
                      <FiEye className="w-5 h-5 text-gray-700" />
                    ) : (
                      <FiEyeOff className="w-5 h-5 text-gray-700" />
                    )}
                  </span>
                </div>

                {/* New Password */}
                <div className="relative">
                  <Label>New Password</Label>
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={resetFormData.new_password}
                    onChange={(e) =>
                      setResetFormData({ ...resetFormData, new_password: e.target.value })
                    }
                    className="pr-10"
                  />
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute top-9 right-3 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <FiEye className="w-5 h-5 text-gray-700" />
                    ) : (
                      <FiEyeOff className="w-5 h-5 text-gray-700" />
                    )}
                  </span>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Label>Confirm Password</Label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={resetFormData.confirm_password}
                    onChange={(e) =>
                      setResetFormData({ ...resetFormData, confirm_password: e.target.value })
                    }
                    className="pr-10"
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-9 right-3 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <FiEye className="w-5 h-5 text-gray-700" />
                    ) : (
                      <FiEyeOff className="w-5 h-5 text-gray-700" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-2 mt-4">
              <Button variant="outline" onClick={closeResetModal}>
                Cancel
              </Button>
              <button type="button" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => handleResetPassword()}>
                Submit
              </button>
            </div>
          </form>

        </div>
      </Modal>

    </div>
  );
}
