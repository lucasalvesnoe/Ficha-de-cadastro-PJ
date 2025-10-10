import React, { useMemo, useState } from 'react';
import { usePJData } from '../hooks/usePJData';
import { differenceInDays, parseISO, isSameMonth, isAfter } from 'date-fns';

import Sidebar from '../components/Sidebar';
import KPICard from '../components/KPICard';
import ContractsChart from '../components/ContractsChart';
import PJTable from '../components/PJTable';
import AgeGroupChart from '../components/AgeGroupChart';
import BirthdaysCard from '../components/BirthdaysCard';

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const Dashboard: React.FC = () => {
    const { data, loading } = usePJData();
    const [copySuccess, setCopySuccess] = useState('');

    const copyLinkToClipboard = () => {
        const url = `${window.location.origin}${window.location.pathname}#/cadastro`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess('Link copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Falha ao copiar.');
        });
    };

    const activeData = useMemo(() => {
        if (!data) return [];
        const today = new Date();
        return data.filter(p => !p.dataFim || isAfter(parseISO(p.dataFim), today));
    }, [data]);

    const kpis = useMemo(() => {
        if (!data || data.length === 0) {
            return { headCount: 0, expiringSoon: 0, turnover: '0.0%', daysOffAvg: 0, admitidosMes: 0, demitidosMes: 0 };
        }

        const today = new Date();

        const expiringSoon = activeData.filter(pj => {
            const contractEndDate = parseISO(pj.dataPrevistaPagamento);
            return differenceInDays(contractEndDate, today) <= 30 && differenceInDays(contractEndDate, today) >= 0;
        }).length;

        const admitidosMes = data.filter(pj => {
            try {
                return isSameMonth(parseISO(pj.dataInicio), today);
            } catch (e) { return false; }
        }).length;
        
        const demitidosMes = data.filter(pj => {
            try {
                return pj.dataFim && isSameMonth(parseISO(pj.dataFim), today);
            } catch (e) { return false; }
        }).length;

        // Lógica de Turnover e Days Off simulada
        const turnover = 5.2; 
        const daysOffAvg = 18;

        return {
            headCount: activeData.length,
            expiringSoon,
            turnover: `${turnover.toFixed(1)}%`,
            daysOffAvg,
            admitidosMes,
            demitidosMes
        };
    }, [data, activeData]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Gestão PJ</h1>
                        <p className="text-gray-600 mt-1">Visão geral dos seus colaboradores Pessoa Jurídica.</p>
                    </div>
                    <button
                        onClick={copyLinkToClipboard}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
                    >
                        <LinkIcon />
                        {copySuccess || 'Copiar Link de Cadastro'}
                    </button>
                </header>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <KPICard title="Head Count" value={kpis.headCount.toString()} />
                    <KPICard title="Contratos a Vencer (30d)" value={kpis.expiringSoon.toString()} />
                    <KPICard title="Admitidos no Mês" value={kpis.admitidosMes.toString()} />
                    <KPICard title="Demitidos no Mês" value={kpis.demitidosMes.toString()} />
                    <KPICard title="Turnover (Anual)" value={kpis.turnover} />
                    <KPICard title="Média de Days Off" value={`${kpis.daysOffAvg} dias`} />
                </div>
                
                {/* Charts and Tables */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Vencimento de Contratos</h2>
                        <ContractsChart data={activeData} />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Faixa Etária</h2>
                            <AgeGroupChart data={activeData} />
                        </div>
                         <div className="bg-white p-6 rounded-lg shadow">
                            <BirthdaysCard data={activeData} />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <PJTable data={data} />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;