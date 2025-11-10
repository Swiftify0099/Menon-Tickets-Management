import { useState, useEffect } from "react";
import { services } from "../../../../http";

export const useServices = (providerId) => {
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!providerId) {
      setServicesList([]);
      return;
    }

    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await services(providerId);
        if (res.status === 200) {
          setServicesList(res.data || []);
        }
      } catch (err) {
        setError("Failed to load services");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [providerId]);

  return { servicesList, loading, error };
};