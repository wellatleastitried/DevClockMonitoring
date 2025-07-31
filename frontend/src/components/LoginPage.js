import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

const LoginPage = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const users = await userService.getAvailableUsers();
        setAvailableUsers(users);
      } catch (err) {
        console.error('Failed to fetch available users:', err);
        setAvailableUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchAvailableUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onLogin(username.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">DevClock Monitoring</h1>
            <p className="text-gray-600">Track development vs customer wait time</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Available Users:</h3>
            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="text-sm text-gray-500">Loading available users...</div>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-sm text-red-600">Failed to load users. Please check server connection.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div 
                    key={user.username}
                    className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setUsername(user.username)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-500">{user.displayName || user.role}</div>
                      </div>
                      <div className="text-xs text-gray-400">{user.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Click on a user above to auto-fill, or type the username manually
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
