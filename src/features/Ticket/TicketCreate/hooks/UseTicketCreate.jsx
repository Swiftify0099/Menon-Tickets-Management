import { useState } from "react";
import { createTicket } from "../../../../http";

export const useTicketCreate = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [error, setError] = useState(null);

  const submit = async (formData, onSuccess) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await createTicket(formData);

      if (res.status === 200) {
        setTicketNumber(res.data.ticket_number);
        setSuccess(true);
        onSuccess?.(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { loading, success, ticketNumber, error, submit };
};