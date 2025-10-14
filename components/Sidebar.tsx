import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import IntelliwayLogo from './IntelliwayLogo';

// FIX: The original inline type for NavItem props was causing a type error where the `children` prop was not being recognized.
// Defining the props with an interface is a more robust pattern that fixes the issue.
interface NavItemProps {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

// FIX: Explicitly typing NavItem as a React.FC to ensure TypeScript correctly recognizes the `children` prop passed via JSX.
const NavItem: React.FC<NavItemProps> = ({ to, icon, children }) => {
    const baseClasses = "flex items-center px-4 py-3 text-gray-200 rounded-md transition-colors duration-200";
    const activeClasses = "bg-cyan-700 text-white font-semibold";
    const hoverClasses = "hover:bg-cyan-800 hover:text-white";
    
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : ''} ${hoverClasses}`}
        >
            {icon}
            <span className="ml-3">{children}</span>
        </NavLink>
    );
};


const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    return (
        <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
            <div className="h-20 flex items-center justify-center border-b border-gray-700 px-4">
                <div className="bg-white p-2 rounded-md">
                    <IntelliwayLogo className="h-10 w-auto" />
                </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavItem to="/dashboard" icon={<DashboardIcon />}>Dashboard</NavItem>
                <NavItem to="/prestadores" icon={<UsersIcon />}>Prestadores</NavItem>
                <NavItem to="/notas-fiscais" icon={<InvoiceIcon />}>Notas Fiscais</NavItem>
                <NavItem to="/cadastro" icon={<AddUserIcon />}>Novo Cadastro</NavItem>
            </nav>
            <div className="px-4 py-4 border-t border-gray-700">
                 <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-gray-300 rounded-md transition-colors duration-200 hover:bg-red-800/50 hover:text-white"
                >
                    <LogoutIcon />
                    <span className="ml-3">Sair</span>
                </button>
            </div>
        </aside>
    );
};

const DashboardIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const AddUserIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.125-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.125-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
const InvoiceIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
const LogoutIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>

export default Sidebar;