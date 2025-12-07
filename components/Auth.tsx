import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  existingUsers: User[];
  backgroundImageUrl: string;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, existingUsers, backgroundImageUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Added for registration
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email (or username) and password.');
      return;
    }

    if (!isLogin && !name) {
        setError('Please enter a name.');
        return;
    }

    if (isLogin) {
        // Find user in database by email OR username
        const user = existingUsers.find(u => 
            (u.email === email || u.username === email) && u.password === password
        );
        
        if (user) {
            if (user.isPaused) {
                setError('Accesso account sospeso. Contattare l\'amministratore.');
            } else {
                onLogin(user);
            }
        } else {
            setError('Invalid credentials. Please try again.');
        }
    } else {
        // Registration Logic
        if (password.length < 4) {
            setError('Password must be at least 4 characters.');
            return;
        }

        // Check if email already exists
        const exists = existingUsers.some(u => u.email === email);
        if (exists) {
            setError('Email is already in use.');
            return;
        }

        const newUser: User = {
            id: `u-${Date.now()}`,
            email,
            username: email.split('@')[0], // Default username
            password,
            name,
            role: 'user',
            isPaused: false,
            myList: []
        };

        onRegister(newUser);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#141414] font-sans">
      {/* Background Image Container - Using CSS background for robustness */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={{
            backgroundImage: `url('${backgroundImageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Gradients and Overlays for text readability */}
        {/* Slightly reduced opacity from 50 to 40 for better visibility of image */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* Header */}
      <div className="relative z-20 px-4 py-4 md:px-12 flex justify-between items-center">
        <h1 className="text-red-600 text-4xl font-bold uppercase tracking-tighter drop-shadow-md">ARCHEOPLAY</h1>
      </div>

      {/* Form Container */}
      <div className="relative z-20 flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
        <div className="w-full max-w-[450px] rounded-md bg-black/75 px-8 py-10 md:px-16 md:py-16 text-white shadow-2xl backdrop-blur-sm">
          <h2 className="mb-8 text-3xl font-bold">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Name Input (Only for Sign Up) */}
            {!isLogin && (
                <div className="relative">
                <input
                    type="text"
                    placeholder="Full Name"
                    className="peer w-full rounded bg-[#333] px-5 py-4 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-gray-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="name"
                />
                <label 
                    htmlFor="name"
                    className="absolute left-5 top-1 text-xs text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-400"
                >
                    Full Name
                </label>
                </div>
            )}

            <div className="relative">
              <input
                type="text"
                placeholder={isLogin ? "Email or User" : "Email"}
                className="peer w-full rounded bg-[#333] px-5 py-4 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
              />
              <label 
                htmlFor="email"
                className="absolute left-5 top-1 text-xs text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-400"
              >
                {isLogin ? "Email or User" : "Email"}
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="peer w-full rounded bg-[#333] px-5 py-4 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
              />
              <label 
                 htmlFor="password"
                 className="absolute left-5 top-1 text-xs text-gray-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-xs peer-focus:text-gray-400"
              >
                Password
              </label>
            </div>

            {error && <p className="text-sm text-[#e50914]">{error}</p>}

            <button
              type="submit"
              className="mt-6 w-full rounded bg-[#e50914] py-3 font-bold text-white transition hover:bg-[#c11119]"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>

            <div className="mt-2 flex items-center justify-between text-sm text-[#b3b3b3]">
              <div className="flex items-center gap-1">
                <input type="checkbox" id="remember" className="rounded bg-[#333]" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button type="button" className="hover:underline">Need help?</button>
            </div>
          </form>

          <div className="mt-16 text-[#737373]">
            {isLogin ? 'New to Archeoplay? ' : 'Already have an account? '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-white hover:underline"
            >
              {isLogin ? 'Sign up now.' : 'Sign in.'}
            </button>
          </div>
          <div className="mt-4 text-xs text-[#8c8c8c]">
             This page is protected by Google reCAPTCHA to ensure you're not a bot.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;