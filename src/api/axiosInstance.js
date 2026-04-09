import axios from "axios";


const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const status = error?.response?.status;

//     if (status === 401) {
//       console.warn("⛔ Token expired. Redirecting to login...");

//       // clear token
//       localStorage.removeItem("token");

//       // redirect to login
//       window.location.href = "/login";  
//     }

//     return Promise.reject(error);
//   }
// );
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // If backend says token is invalid/expired → forcibly show login page
    if (status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

// console.log("Current Base URL:", import.meta.env.VITE_API_BASE_URL); 
// // If this prints 'undefined', your .env file is not being read.

export default axiosInstance;


