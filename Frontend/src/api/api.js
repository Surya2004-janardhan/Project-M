import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/ '

const api = axios.create({
  baseURL: "http://localhost:5000/", // change to your backend URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});



export const fetchApi = async (method, url, data = {},config = {}) => {
  try {
       const headers = { ...config.headers };

    // Skip token for login & signup
    if (!url.includes("/login") && !url.includes("/signup")) {
      const token = localStorage.getItem("token-project-M");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    const response = await api({
      method: method.toLowerCase(),
      url,
      data: ["post", "put", "patch"].includes(method.toLowerCase()) ? data : undefined,
      params: method.toLowerCase() === "get" ? data : undefined,
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};