import api from "../utils/axios.config";

export const VerifyMe = async (selfie, drivers_license) => {
  const data = {
    selfie: selfie,
    drivers_license: drivers_license,
  };

  const res = api.post("/auth/rider/", data);

  return res;
};

export const ToggleAvailability = async () => {
  const res = await api.post("/rider/online-status/");

  return res;
};

export const GetProfileDtails = async () => {
  const res = await api.get("/auth/me/");

  return res;
};

