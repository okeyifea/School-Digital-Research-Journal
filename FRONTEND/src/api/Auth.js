const BASE_API_URL = import.meta.env.VITE_API_URL || "/api";

export const API_URL = BASE_API_URL;

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("Server did not return JSON");
  }
  return response.json();
};

export const signupUser = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Signup API error:", error);
    return { success: false, message: "Network error or invalid response from server" };
  }
};

export const loginUser = async (data) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await parseJsonResponse(response);
  } catch (error) {
    console.error("Login API error:", error);
    return { success: false, message: "Network error. Please try again." };
  }
};
