import api from "../utils/axios.config";

export const FetchAllErrands = async () => {
  const res = await api.get("/errands/history/");

  return res;
};
