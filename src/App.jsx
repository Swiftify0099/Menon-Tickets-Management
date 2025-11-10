import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import RouterConfig from "./routes/RouterConfig";

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 mx-auto"></div>
              <p className="mt-6 text-xl text-orange-700 font-medium">Loading App...</p>
            </div>
          </div>
        }
        persistor={persistor}
      >
        <RouterConfig />
      </PersistGate>
    </Provider>
  );
}

export default App;