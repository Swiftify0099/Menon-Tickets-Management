import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tickets: [],
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    addTicket: (state, action) => {
      state.tickets.push(action.payload);
      localStorage.setItem("dashboard-tickets", JSON.stringify(state.tickets));
    },
    getLlTakits: (state, action) => {
      state.tickets = action.payload;
      localStorage.setItem("dashboard-tickets", JSON.stringify(state.tickets));
    },
    updateTicket: (state, action) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
        localStorage.setItem("dashboard-tickets", JSON.stringify(state.tickets));
      }
    },
    deleteTicket: (state, action) => {
      state.tickets = state.tickets.filter(
        (ticket) => ticket.id.toString() !== action.payload.toString()
      );
      localStorage.setItem("dashboard-tickets", JSON.stringify(state.tickets));
    },
    markComplete: (state, action) => {
      const ticket = state.tickets.find(t => t.id.toString() === action.payload.toString());
      if (ticket) ticket.status = "Completed";
      localStorage.setItem("dashboard-tickets", JSON.stringify(state.tickets));
    },
    reopenTicket: (state, action) => {
      const { id, reason } = action.payload;
      const ticket = state.tickets.find(t => t.id.toString() === id.toString());
      if (ticket) {
        ticket.status = "In-Progress";
        ticket.reopenReason = reason;
      }
      localStorage.setItem("dashboard-tickets", JSON.stringify(state.tickets));
    },
    updateRemarks: (state, action) => {
      const { id, remarks } = action.payload;
      const ticket = state.tickets.find(t => t.id.toString() === id.toString());
      if (ticket) ticket.remarks = remarks;
      localStorage.setItem("dashboard-tickets", JSON.stringify(state.tickets));
    },
    loadTickets: (state, action) => {
      state.tickets = action.payload;
    },
  },
});

export const { addTicket, updateTicket, deleteTicket, markComplete, reopenTicket, updateRemarks, loadTickets } = ticketsSlice.actions;
export default ticketsSlice.reducer;
