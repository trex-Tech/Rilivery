import api from "../utils/axios.config";

export const VerifyMe = async (selfie, drivers_license) => {
  const data = {
    selfie: selfie,
    drivers_license: drivers_license,
  };

  const res = api.post("/auth/rider/", data);

  return res;
};
