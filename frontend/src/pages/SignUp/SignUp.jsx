import { useState } from "react";
import {
  SuccessNotification,
  ErrorNotification,
  FormFieldError,
  NotificationStyles,
} from "../../components/Notification.jsx";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const SignUp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState("");

  const [notification, setNotification] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const type = location.state?.type || "user";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);
    setFormErrors({});

    try {
      const endpoint = "http://localhost:5000/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, type }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Registration successful! Redirecting...",
        });

        setTimeout(() => {
          navigate('/login', { state: { type } })
        }, 2000);

        setName("");
        setEmail("");
        setPassword("");
      } else {
        if (response.status === 400) {
          setFormErrors({ email: data.error || "Invalid input" });
        } else if (response.status === 409) {
          setFormErrors({ email: "Email already exists" });
        } else {
          setNotification({
            type: "error",
            message: "Something went wrong. Please try again.",
          });
        }

        setTimeout(() => {
          setNotification(null);
        }, 2000);
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Network error. Please check your connection.",
      });

      setTimeout(() => {
        setNotification(null);
      }, 2000);
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
          <h1 className="text-4xl font-bold text-blue-900">Create account</h1>
          <p className="text-blue-600">Join us today! Please fill in your details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-blue-700 ml-1">
              Full name
            </label>
            <div className={`relative transition-all duration-300 ${activeInput === 'name' ? 'scale-[1.02]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className={`h-5 w-5 transition-all duration-300 ${
                  activeInput === 'name' ? 'text-blue-600' : 'text-blue-400'
                }`} />
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setActiveInput('name')}
                onBlur={() => setActiveInput('')}
                className="block w-full pl-11 pr-4 py-3.5 border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-300"
                placeholder="John Doe"
                required
              />
              {formErrors.name && <FormFieldError message={formErrors.name} />}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-blue-700 ml-1">
              Email address
            </label>
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
                placeholder="Create a strong password"
                required
              />
              {formErrors.password && <FormFieldError message={formErrors.password} />}
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

          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 rounded-md border-blue-200 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                required
              />
            </div>
            <label htmlFor="terms" className="text-sm text-blue-700">
              I agree to the{' '}
              <button type="button" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                Privacy Policy
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden group shadow-lg shadow-blue-500/30"
          >
            <div className="relative flex items-center justify-center space-x-2">
              <span className={`transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                Create account
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
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login', { state: { type } })}
              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Sign in
            </button>
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-blue-700">Or sign up with</span>
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

export default SignUp;