import api from "../utils/axios.config";

export const FetchAllOnlineRiders = async () => {
  const res = await api.get("/riders/online/");

  return res;
};

export const SendErrand = async (
  pickup_location,
  drop_off_location,
  price,
  rider
) => {
  const data = {
    pickup_location: pickup_location,
    drop_off_location: drop_off_location,
    price: price,
    rider: rider,
  };

  const res = await api.post("/create-errand/", data);

  return res;
};

export const fetchRiderErrands = async (rider_id) => {
  const res = await api.get(`/errands/user/${rider_id}/`);

  return res;
};
