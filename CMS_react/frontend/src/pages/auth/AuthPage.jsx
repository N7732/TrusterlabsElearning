import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card, { CardContent } from '../../components/common/Card';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, registerLearner } = useAuth();
  
  // Determine initial tab from path
  const initialTab = location.pathname === '/register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Update tab if route changes
  useEffect(() => {
    setActiveTab(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const from = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username: loginEmail, password: loginPassword });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerLearner({
        username: regData.email,
        first_name: regData.first_name,
        last_name: regData.last_name,
        email: regData.email,
        password: regData.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setError('');
    navigate(`/${tab}`, { replace: true, state: location.state });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-4 text-center text-sm font-bold transition-colors ${
                activeTab === 'login'
                  ? 'text-[#273B76] border-b-2 border-[#273B76]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-4 text-center text-sm font-bold transition-colors ${
                activeTab === 'register'
                  ? 'text-[#273B76] border-b-2 border-[#273B76]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Register
            </button>
          </div>

          <CardContent className="pt-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-6">
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              /* LOGIN FORM */
              <form className="space-y-6" onSubmit={handleLoginSubmit}>
                <Input
                  label="Email address"
                  id="email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#273B76] focus:ring-[#273B76] border-slate-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-[#273B76] hover:text-[#1a2850]">
                      Forgot your password?
                    </a>
                  </div>
                </div>
                <Button type="submit" fullWidth disabled={loading} className="!bg-[#FFD700] hover:!bg-[#F0C800] !text-black font-bold">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    id="first_name"
                    type="text"
                    required
                    value={regData.first_name}
                    onChange={(e) => setRegData({ ...regData, first_name: e.target.value })}
                  />
                  <Input
                    label="Last Name"
                    id="last_name"
                    type="text"
                    required
                    value={regData.last_name}
                    onChange={(e) => setRegData({ ...regData, last_name: e.target.value })}
                  />
                </div>
                <Input
                  label="Email address"
                  id="reg_email"
                  type="email"
                  required
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                />
                <Input
                  label="Password"
                  id="reg_password"
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                />
                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  type="password"
                  required
                  value={regData.confirmPassword}
                  onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                />
                <Button type="submit" fullWidth disabled={loading} className="!bg-[#FFD700] hover:!bg-[#F0C800] !text-black font-bold">
                  {loading ? 'Creating account...' : 'Register'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
