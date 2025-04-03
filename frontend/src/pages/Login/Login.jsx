import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SuccessNotification, ErrorNotification, FormFieldError, NotificationStyles } from '../../components/Notification.jsx';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from "../../context/AuthContext.jsx";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const type = location.state?.type || "user";
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  const [notification, setNotification] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);
    setFormErrors({});

    try {
      const endpoint = type === "user" 
        ? "http://localhost:5000/login"
        : "http://localhost:5000/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password, type }),
      });

      const data = await response.json();

      if (response.ok) {
        if (type !== data.user.user_type) {
          setNotification({
            type: 'error',
            message: `This account is registered as a ${data.user.user_type}. Please use the ${data.user.user_type} login instead.`
          });
          setIsLoading(false);
          return;
        }

        setNotification({
          type: 'success',
          message: 'Successfully logged in! Redirecting...'
        });

        localStorage.setItem("categoriesSelected", data.categoriesSelected);

        if (data.user.user_type === "user") {   
          localStorage.setItem("user_id", data.user.user_id);
        } else {
          localStorage.setItem("user_id", data.user.user_id);
        }
        
        localStorage.setItem("name", data.user.name);
        login(data.token, data.user.user_type);

        if (type === data.user.user_type) {
          const targetDashboard = data.user.user_type === "user" ? "/user/dashboard" : "/company/dashboard";
          navigate(targetDashboard);
        }

      } else {
        if (response.status === 400) {
          setFormErrors(data.errors || { email: "Invalid credentials" });
        } else {
          setNotification({
            type: 'error',
            message: 'Invalid email or password. Please try again.',
          });
        }
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: `${error}`,
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-50 p-4 overflow-hidden">
    <NotificationStyles />
    
    {notification?.type === 'success' && (
      <SuccessNotification
        message={notification.message}
        onClose={() => setNotification(null)}
        duration={notification.duration}
      />
    )}
    
    {notification?.type === 'error' && (
      <ErrorNotification
        message={notification.message}
        onClose={() => setNotification(null)}
        duration={notification.duration}
      />
    )}

    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>
    
    <div className="relative w-full max-w-md">
      <div className="relative backdrop-blur-xl bg-white/90 p-8 rounded-3xl border border-white/30 shadow-xl shadow-blue-900/5">
        <div className="space-y-2 mb-8 text-center">
          <h1 className="text-4xl font-bold text-blue-900">Welcome back</h1>
          <p className="text-blue-600">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-blue-700 ml-1">Email address</label>
            <div className={`relative transition-all duration-300 ${activeInput === 'email' ? 'scale-[1.02]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 transition-all duration-300 ${
                  activeInput === 'email' ? 'text-blue-600' : 'text-blue-400'
                }`} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setActiveInput('email')}
                onBlur={() => setActiveInput('')}
                className="block w-full pl-11 pr-4 py-3.5 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-300"
                placeholder="name@company.com"
                required
              />
              {formErrors.email && <FormFieldError message={formErrors.email} />}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-blue-700 ml-1">Password</label>
            <div className={`relative transition-all duration-300 ${activeInput === 'password' ? 'scale-[1.02]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 transition-all duration-300 ${
                  activeInput === 'password' ? 'text-blue-600' : 'text-blue-400'
                }`} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveInput('password')}
                onBlur={() => setActiveInput('')}
                className="block w-full pl-11 pr-12 py-3.5 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-300"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-blue-400 hover:text-blue-600 transition-all duration-300" />
                ) : (
                  <Eye className="h-5 w-5 text-blue-400 hover:text-blue-600 transition-all duration-300" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-md border-blue-200 text-blue-600 focus:ring-blue-500 transition-all duration-300"
              />
              <span className="text-sm text-blue-700">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-all duration-300"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden group shadow-lg shadow-blue-500/30"
          >
            <div className="relative flex items-center justify-center space-x-2">
              <span className={`transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Sign in
              </span>
              {isLoading ? (
                <Loader2 className="absolute h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              )}
            </div>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-blue-100">
          <p className="text-center text-blue-700">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/signUp', { state: { type } })}
              className="font-semibold text-blue-600 hover:text-blue-800 transition-all duration-300"
            >
              Create account
            </button>
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-blue-700">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Google', 'GitHub', 'Twitter'].map((provider) => (
              <button
                key={provider}
                className="flex items-center justify-center py-2.5 px-4 border-2 border-blue-100 rounded-xl hover:bg-blue-50 hover:border-blue-300 bg-white/70 backdrop-blur-sm transition-all duration-300 group"
              >
                <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">{provider}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Login;