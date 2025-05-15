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
