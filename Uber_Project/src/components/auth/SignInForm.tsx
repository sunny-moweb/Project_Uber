import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Label from "../form/Label";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import API from "./axiosInstance";
import { useLoader } from "../common/LoaderContext";
import { FiEye,FiEyeOff } from "react-icons/fi";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  //* Loader
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Email is required")
      .email("Enter a valid email"),
    password: Yup.string()
      .required("Password is required"),
  });

  //! Admin SignIn API
  const handleSignIn = async (values: typeof initialValues) => {
    const payload = {
      email: values.email,
      password: values.password,
    };

    try {
      showLoader();
      const response = await API.post("/login", payload);

      // Handle success
      if (response.status === 200) {
        console.log("Login successful:", response.data);
        const { access, refresh,role, permissions  } = response.data.data;

        // Save tokens
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("user_role", role); 
        const flattenedPermissions = permissions.flat(); // Flatten the nested array
        localStorage.setItem("permissions", JSON.stringify(flattenedPermissions));
        navigate("/home");
      } else {
        console.error("Login failed:", response.data.message);
      }
    } catch (error: any) {
      console.error("Error during login:", error.response?.data || error.message);

      if (error.response && error.response.data) {
        const serverError = error.response.data;

        const message =
          serverError.errors?.invalid_credential ||
          serverError.errors?.email ||
          serverError.message ||
          "Login failed. Please try again.";
        setLoginError(message);
      } else {
        setLoginError("Login failed. Please check your network and try again.");
      }
    } finally {
      hideLoader();
    }
  };

  const handleDriverLogin = () => {
    navigate("/driver/login"); // Redirect to Driver Login page
  };

  return (
    <div className="flex flex-col flex-1 mt-10">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSignIn}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form>
                  <div className="space-y-6">
                    <div>
                      <Label>
                        Email <span className="text-error-500">*</span>
                      </Label>
                      <Field
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-error-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label>
                        Password <span className="text-error-500">*</span>
                      </Label>
                      <div className="relative">
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500"
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showPassword ? (
                            <FiEye className="w-5 h-3.5 text-gray-700 dark:text-gray-300" />
                          ) : (
                            <FiEyeOff  className="w-5 h-3.5 text-gray-700 dark:text-gray-300" />
                          )}
                        </span>
                      </div>
                      {loginError && (
                        <div className="text-red-500 text-sm mt-2">{loginError}</div>
                      )}
                      <div className="text-right mt-1">
                        <button
                          type="button"
                          onClick={() => navigate("/admin/forgot-password")}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={isSubmitting}
                      >
                        Sign in
                      </button>
                    </div>
                    <div>
                      <button
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                        onClick={handleDriverLogin}
                      >
                        Login as Driver
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}








// --------original---------
// import { useState } from "react";
// import { useNavigate } from "react-router";
// import { EyeCloseIcon, EyeIcon } from "../../icons";
// import Label from "../form/Label";
// // import Input from "../form/input/InputField";
// import Checkbox from "../form/input/Checkbox";
// // import Button from "../ui/button/Button";
// import { Formik, Form, Field, ErrorMessage } from "formik";
// import * as Yup from "yup";

// export default function SignInForm() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   const navigate = useNavigate();

//   const initialValues = {
//     username: "",
//     password: "",
//     rememberMe: false,
//   };

//   const validationSchema = Yup.object({
//     username: Yup.string()
//       .required("Username is required")
//       .min(3, "Username must be at least 3 characters"),
//     password: Yup.string()
//       .required("Password is required")
//       .min(6, "Password must be at least 6 characters"),
//     rememberMe: Yup.boolean(),
//   });

//   const handleSignIn = (values: typeof initialValues) => {
//     console.log("Form Values:", values);
//     // Implement sign-in logic here
//   };

//   const handleDriverLogin = () => {
//     // window.location.href="/driver-login";
//     navigate("/driver-login");
//   };

//   return (
//     <div className="flex flex-col flex-1">
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign In
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Enter your username and password to sign in!
//             </p>
//           </div>
//           <div>
//             <Formik
//               initialValues={initialValues}
//               validationSchema={validationSchema}
//               onSubmit={handleSignIn}
//             >
//               {({ isSubmitting, values, setFieldValue }) => (
//                 <Form>
//                   <div className="space-y-6">
//                     <div>
//                       <Label>
//                         Username <span className="text-error-500">*</span>
//                       </Label>
//                       <Field
//                         name="username"
//                         type="text"
//                         placeholder="Enter Username"
//                         className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500"
//                       />
//                       <ErrorMessage
//                         name="username"
//                         component="div"
//                         className="text-error-500 text-sm mt-1"
//                       />
//                     </div>
//                     <div>
//                       <Label>
//                         Password <span className="text-error-500">*</span>
//                       </Label>
//                       <div className="relative">
//                         <Field
//                           name="password"
//                           type={showPassword ? "text" : "password"}
//                           placeholder="Enter your password"
//                           className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-brand-500"
//                         />
//                         <span
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
//                         >
//                           {showPassword ? (
//                             <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
//                           ) : (
//                             <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
//                           )}
//                         </span>
//                       </div>
//                       <ErrorMessage
//                         name="password"
//                         component="div"
//                         className="text-error-500 text-sm mt-1"
//                       />
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <Checkbox
//                           checked={values.rememberMe}
//                           onChange={() => setFieldValue("rememberMe", !values.rememberMe)}
//                         />
//                         <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
//                           Keep me logged in
//                         </span>
//                       </div>
//                     </div>
//                     <div>
//                       <button
//                         type="submit"
//                         className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50"
//                         disabled={isSubmitting}
//                       >
//                         Sign in
//                       </button>
//                     </div>
//                     <div>
//                       <button
//                         className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
//                         onClick={handleDriverLogin}
//                       >
//                         Login as Driver
//                       </button>
//                     </div>
//                   </div>
//                 </Form>
//               )}
//             </Formik>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }