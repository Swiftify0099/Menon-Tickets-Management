import { useState, useEffect } from "react";
import { ServiceProvider } from "../../../../http";

export const useProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const res = await ServiceProvider();
        if (res.status === 200) {
          setProviders(res.data || []);
        }
      } catch (err) {
        setError("Failed to load providers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  return { providers, loading, error };
};