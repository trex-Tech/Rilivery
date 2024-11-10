import api from "../utils/axios.config";

export const FetchAllOnlineRiders = async () => {
  const res = await api.get("/riders/online/");

  return res;
};
