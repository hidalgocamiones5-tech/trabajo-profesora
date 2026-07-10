import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, ArrowRight, Building2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Proyecto2026@') {
      setError('');
      onLogin();
    } else {
      setError('Contraseña incorrecta para ver el boceto.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-lemon-400/20 blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl opacity-50 mix-blend-multiply pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Area */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-lemon-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lemon-500/30 mb-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="w-8 h-8 border-4 border-white rounded-md"></div>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Bienvenido a GRC</h1>
          <p className="text-slate-500 mt-2">Plataforma integral de cumplimiento</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-lemon-500 focus:border-lemon-500 text-sm transition-all outline-none"
                  placeholder="nombre@empresa.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                <a href="#" className="text-xs font-medium text-lemon-600 hover:text-lemon-700">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white/50 focus:ring-2 focus:ring-lemon-500 focus:border-lemon-500 text-sm transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded-lg border border-red-100 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
            >
              Iniciar Sesión
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-slate-500 bg-white/70 backdrop-blur-sm">O ingresa con</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setError('Por favor, usa la contraseña del proyecto arriba.')}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Single Sign-On (Microsoft / Okta)</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-sm text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Conexión segura y cifrada
        </div>
      </motion.div>
    </div>
  );
};
