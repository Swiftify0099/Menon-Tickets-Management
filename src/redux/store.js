import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import ticketsReducer from './slices/ticketsSlice';
import loginReducer from './slices/login';

const ticketsPersistConfig = {
  key: 'dashboard-tickets',
  storage,
};

const loginPersistConfig = {
  key: 'login',
  storage,
};

const persistedTicketsReducer = persistReducer(ticketsPersistConfig, ticketsReducer);
const persistedLoginReducer = persistReducer(loginPersistConfig, loginReducer);

export const store = configureStore({
  reducer: {
    tickets: persistedTicketsReducer,
    login: persistedLoginReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
