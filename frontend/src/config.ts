// API Configuration

//TODO: Implement a production environment

const getApiUrl = () => {
  // In development, use the environment variable or default to localhost
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  }

  // In production, use the environment variable or default to relative path
  return process.env.NEXT_PUBLIC_API_URL || "";
};

export const config = {
  apiUrl: getApiUrl(),
  endpoints: {
    auth: {
      register: "/api/auth/register",
      login: "/api/auth/login",
    },
    providers: {
      list: "/api/providers",
      create: "/api/providers",
      update: (id: string) => `/api/providers/${id}`,
    },
    matching: {
      providers: "/api/match/providers",
    },
  },
};
