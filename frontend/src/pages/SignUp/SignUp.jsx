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
  Building2,
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

  // const navigate = useNavigate();

  // console.log("Type is", type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);
    setFormErrors({});

    try {
      const endpoint =
        type === "user"
          ? "http://localhost:5000/registerUser"
          : "http://localhost:5000/registerCompany";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: "success",
          message: "Registration successful! Redirecting...",
        });

        setTimeout(() => {
          navigate("/");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[conic-gradient(at_bottom_right,var(--tw-gradient-stops))] from-blue-50 via-purple-50 to-pink-50 p-4 overflow-hidden">
      {/* Animated Background Elements */}

      <NotificationStyles />

      {/* Show notifications */}
      {notification?.type === "success" && (
        <SuccessNotification
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={notification.duration} // Optional, defaults to 5000ms
        />
      )}

      {notification?.type === "error" && (
        <ErrorNotification
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={notification.duration} // Optional, defaults to 5000ms
        />
      )}

      <div className="fixed inset-0">
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-48 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-md">
        {/* Sign Up Form Card */}
        <div className="relative backdrop-blur-xl bg-white/80 p-8 rounded-3xl border border-white/20 shadow-2xl shadow-black/5 hover:shadow-black/10 transition-all duration-500">
          {/* Header Section */}
          <div className="space-y-2 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-300% pb-1">
              Create account
            </h1>
            <p className="text-gray-600">
              Join us today! Please fill in your details
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 ml-1"
              >
                Full name
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  activeInput === "name" ? "scale-[1.02]" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User
                    className={`h-5 w-5 transition-all duration-300 ${
                      activeInput === "name"
                        ? "text-blue-600 scale-110"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setActiveInput("name")}
                  onBlur={() => setActiveInput("")}
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                  placeholder="John Doe"
                  required
                />
                {formErrors.name && (
                  <FormFieldError message={formErrors.name} />
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 ml-1"
              >
                Email address
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  activeInput === "email" ? "scale-[1.02]" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail
                    className={`h-5 w-5 transition-all duration-300 ${
                      activeInput === "email"
                        ? "text-blue-600 scale-110"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveInput("email")}
                  onBlur={() => setActiveInput("")}
                  className="block w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                  placeholder="name@company.com"
                  required
                />
                {formErrors.email && (
                  <FormFieldError message={formErrors.email} />
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 ml-1"
              >
                Password
              </label>
              <div
                className={`relative transition-all duration-300 ${
                  activeInput === "password" ? "scale-[1.02]" : ""
                }`}
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock
                    className={`h-5 w-5 transition-all duration-300 ${
                      activeInput === "password"
                        ? "text-blue-600 scale-110"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveInput("password")}
                  onBlur={() => setActiveInput("")}
                  className="block w-full pl-11 pr-12 py-3.5 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300"
                  placeholder="Create a strong password"
                  required
                />
                {formErrors.password && (
                  <FormFieldError message={formErrors.password} />
                )}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms & Privacy */}
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden group animate-gradient bg-300%"
            >
              <div className="relative flex items-center justify-center space-x-2">
                <span
                  className={`transition-all duration-300 ${
                    isLoading ? "opacity-0" : "opacity-100"
                  }`}
                >
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

          {/* Sign In Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() =>navigate("/login", { state: { type } })}
                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Social Sign Up Options */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500">
                  Or sign up with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["Google", "GitHub", "Twitter"].map((provider) => (
                <button
                  key={provider}
                  className="flex items-center justify-center py-2.5 px-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group"
                >
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                    {provider}
                  </span>
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
