import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import IntelliwayLogo from '../components/IntelliwayLogo';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica de validação simples. Qualquer e-mail/senha é aceito.
        if (email && password) {
            onLogin();
            navigate('/dashboard');
        } else {
            alert('Por favor, preencha e-mail e senha.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
                <IntelliwayLogo className="h-12 w-auto mx-auto mb-6" />
                <h2 className="text-center text-2xl font-bold text-gray-800 mb-6">Acesso ao Painel de Gestão</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="gestor@intelliway.com.br"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-700">Senha</label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                                placeholder="********"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
             <p className="mt-6 text-center text-sm text-gray-500">
                Ainda não tem cadastro?{' '}
                <Link to="/cadastro" className="font-medium text-cyan-600 hover:text-cyan-500">
                    Cadastre um novo colaborador
                </Link>
            </p>
        </div>
    );
};

export default Login;
