import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

// Хардкод пользователей
const USERS = {
  admin: {
    email: "go@osama.agency",
    password: "trust1819",
    role: "admin"
  },
  demo: {
    email: "demo",
    password: "demo",
    role: "demo"
  }
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Имитация задержки для реалистичности
    await new Promise(resolve => setTimeout(resolve, 500));

    // Проверка учетных данных
    const user = Object.values(USERS).find(
      u => (u.email === email || (email === "demo" && u.role === "demo")) && u.password === password
    );

    if (user) {
      // Сохраняем роль в localStorage
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
      
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      // Редирект на главную
      navigate("/");
    } else {
      setError("Неверный логин или пароль");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50 space-y-6"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center justify-center mb-4">
              {/* Telegram-style logo */}
              <div className="relative">
                <svg 
                  viewBox="0 0 377 313" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4"
                >
                  <path d="M10.3357 142.918C11.2001 142.481 12.0557 142.071 12.9113 141.678C27.5617 134.876 42.4129 128.529 57.2553 122.173C58.0673 122.173 59.4031 121.256 60.1627 120.933C61.3065 120.444 62.4503 119.964 63.594 119.466C65.7942 118.524 67.9943 117.589 70.1945 116.646C74.5949 114.761 78.9952 112.875 83.4043 110.998C92.205 107.234 101.006 103.471 109.806 99.6997C127.408 92.1737 145.009 84.639 162.611 77.113C180.212 69.5869 197.822 62.0522 215.424 54.5175C233.025 46.9915 250.627 39.4654 268.228 31.9307C285.838 24.396 303.44 16.87 321.041 9.34402C324.952 7.66769 329.187 5.14444 333.378 4.41978C336.896 3.79115 340.336 2.5688 343.872 1.89652C350.604 0.621814 358.016 0.0892996 364.451 2.88318C366.686 3.84357 368.72 5.2143 370.449 6.92555C378.612 15.0191 377.469 28.2812 375.74 39.6575C363.691 118.908 351.651 198.167 339.612 277.425C337.961 288.304 335.726 300.222 327.135 307.093C319.88 312.908 309.534 313.571 300.567 311.092C291.618 308.612 283.69 303.4 275.946 298.266C243.747 276.945 211.556 255.633 179.365 234.312C171.708 229.248 163.187 222.639 163.283 213.463C163.327 207.928 166.627 203.012 169.997 198.62C197.962 162.134 238.342 137.05 268.368 102.249C272.593 97.3511 275.937 88.4719 270.114 85.6518C266.665 83.9668 262.675 86.2542 259.523 88.4457C219.842 116.009 180.16 143.581 140.478 171.153C127.53 180.146 113.945 189.401 98.3429 191.618C84.3822 193.591 70.3342 189.706 56.8101 185.734C45.4862 182.407 34.1797 178.985 22.9169 175.475C16.9362 173.607 10.7547 171.607 6.11864 167.39C1.49128 163.173 -1.15417 156.092 1.62224 150.47C3.36842 146.951 6.77352 144.725 10.3357 142.918Z" fill="url(#paint0_linear_login)"/>
                  <defs>
                    <linearGradient id="paint0_linear_login" x1="0.489746" y1="156.657" x2="376.979" y2="156.657" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#078EF7"/>
                      <stop offset="0.326923" stopColor="#BB61F9"/>
                      <stop offset="0.620192" stopColor="#DF4C9D"/>
                      <stop offset="0.822115" stopColor="#F2445B"/>
                      <stop offset="0.9999" stopColor="#F45409"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
              </div>
              <span
                className="font-bold italic text-white text-2xl"
                style={{ fontFamily: 'Futura PT Extra Bold Italic, Futura, Arial, sans-serif' }}
              >
                ТЕЛЕСАЙТ
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white">Вход в систему</h2>
            <p className="text-gray-400 mt-2">Введите свои учетные данные</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Email/Username input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email или логин
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="email"
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Введите email или логин"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Введите пароль"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-500 focus:ring-offset-0 focus:ring-2"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-300">Запомнить меня</span>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#078EF7] via-[#BB61F9] via-[#DF4C9D] via-[#F2445B] to-[#F45409] bg-[length:200%_200%] animate-gradient-x hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Вход...
              </span>
            ) : (
              "Войти"
            )}
          </button>

          {/* Demo hint */}
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Демо доступ: <span className="text-gray-400">demo / demo</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 