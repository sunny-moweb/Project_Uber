import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    console.log("Using Refresh Token:", refreshToken);
    
    if (!refreshToken) throw new Error("No refresh token found");

    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`,
       { refresh: refreshToken });

    console.log("New Access Token:", data.access);

    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return null; // Indicate failure
  }
};

// Attach token to every request
API.interceptors.request.use((config) => {
  const impersonationToken = localStorage.getItem("impersonation_access_token");
  const accessToken = localStorage.getItem("access_token");
  const token = impersonationToken && impersonationToken.trim() !== "" ? impersonationToken : accessToken;

  if (accessToken || impersonationToken) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  return config;
  // old-code 22-4-25----------------------------------------------
  // const accessToken = localStorage.getItem("access_token");
  // // console.log("Using Access Token in Request:", accessToken);
  // if (accessToken) {
  //   config.headers.Authorization = `Bearer ${accessToken}`;
  // }
  // return config;
}, Promise.reject);



// Handle 401 errors and refresh token if needed
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error.response?.data);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("Token expired, attempting refresh...");
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest); // Retry request
      }
      else {
        console.error("Token refresh failed. User must log in again.");
      }
    }

    return Promise.reject(error);
  }
);

export default API;








// past code 28-3-25------------------------->
// import axios from "axios";

// // Create an Axios instance
// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Function to refresh the access token
// const refreshAccessToken = async () => {
//   try {
//     const refreshToken = localStorage.getItem("refresh_token");
//     if (!refreshToken) {
//       throw new Error("Refresh token not found. Please log in again.");
//     }

//     const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`,
//     {
//       refresh: refreshToken,
//     });

//     const { access } = response.data;
//     localStorage.setItem("access_token", access); // Store the new access token
//     return access;
//   } catc-h (error) {
//     console.error("Error refreshing access token:", error);
//     // Optionally, clear tokens and force the user to log in again
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     throw new Error("Session expired. Please log in again.");
//   }
// };

// // Request interceptor to attach the token before making requests
// API.interceptors.request.use(
//   async (config) => {
//     let accessToken = localStorage.getItem("access_token");

//     if (accessToken) {
//       try {
//         // Decode token to check its expiry
//         const payload = JSON.parse(atob(accessToken.split(".")[1]));
//         const tokenExpiryTime = payload.exp * 1000; // Token expiry time in milliseconds
//         const isExpired = Date.now() >= tokenExpiryTime;

//         if (isExpired) {
//           accessToken = await refreshAccessToken(); // Refresh token if expired
//         }

//         config.headers.Authorization = `Bearer ${accessToken}`;
//       } catch (error) {
//         console.error("Error decoding token:", error);
//         // Clear invalid token and force re-login
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         throw new Error("Invalid access token. Please log in again.");
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor to handle token expiry for failed requests
// API.interceptors.response.use(
//   (response) => response, // If the request is successful, return the response
//   async (error) => {
//     const originalRequest = error.config;

//     // If the error is due to expired access token (status 401), try refreshing the token
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const accessToken = await refreshAccessToken(); // Refresh token
//         axios.defaults.headers["Authorization"] = `Bearer ${accessToken}`;

//         // Retry the original request with the new token
//         return API(originalRequest);
//       } catch (error) {
//         console.error("Failed to refresh token:", error);
//         // Optionally, force re-login
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         // window.location.href = "/login"; // Redirect to login page
//         return Promise.reject(error);
//       }
//     }

//     return Promise.reject(error); // Reject the request if it failed for another reason
//   }
// );

// export default API;









