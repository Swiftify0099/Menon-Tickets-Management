const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="theme">
              Theme
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              id="theme"
            >
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notifications">
              Notifications
            </label>
            <div className="flex items-center">
              <input
                className="mr-2 leading-tight accent-orange-500"
                type="checkbox"
                id="notifications"
              />
              <span className="text-sm">Enable notifications</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition"
              type="button"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
