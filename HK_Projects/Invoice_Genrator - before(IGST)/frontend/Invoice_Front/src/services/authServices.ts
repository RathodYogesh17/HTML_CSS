import api from "../API/api";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/user/loginUser", data);
  return response.data;
};
