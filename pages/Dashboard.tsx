import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom'; // Importa Link
import { usePJData } from '../hooks/usePJData';
// FIX: Added `isSameMonth` to date-fns imports to resolve 'Cannot find name' errors.
import { differenceInDays, parseISO, isAfter, startOfMonth, isBefore, getDay, isSameMonth } from 'date-fns';
import { FormData, NFStatus } from '../types';

import Sidebar from '../components/Sidebar';
import KPICard from '../components/KPICard';
import ContractsChart from '../components/ContractsChart';
import AgeGroupChart from '../components/AgeGroupChart';
import BirthdaysCard from '../components/BirthdaysCard';

// Mock de estado de NFs, que será substituído por uma lógica real na página de NFs
const useMockInvoiceStatus = (data: FormData[]) => {
    return useMemo(() => {
        const statuses: Record<string, NFStatus> = {};
        data.forEach((pj, index) => {
            if (index % 4 === 0) statuses[pj.cnpj] = NFStatus.VALIDADA;
            else if (index % 3 === 0) statuses[pj.cnpj] = NFStatus.ATRASADA;
            else statuses[pj.cnpj] = NFStatus.PENDENTE;
        });
        return statuses;
    }, [data]);
};


const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const ExportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ImportIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


const Dashboard: React.FC = () => {
    const { data, loading, importData } = usePJData();
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
    
    const handleExport = () => {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dados_pjs.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const importedJson = JSON.parse(text);
                    if (Array.isArray(importedJson) && (importedJson.length === 0 || importedJson[0].cnpj)) {
                        importData(importedJson);
                        alert(`${importedJson.length} registros importados com sucesso!`);
                    } else {
                        throw new Error('Formato do arquivo inválido.');
                    }
                }
            } catch (error) {
                console.error("Erro ao importar dados:", error);
                alert("Falha ao importar. Verifique se o arquivo JSON é válido.");
            }
        };
        // FIX: Changed `readText` to `readAsText`, which is the correct method name for FileReader.
        reader.readAsText(file);
    };

    const triggerImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => handleImport(e as unknown as React.ChangeEvent<HTMLInputElement>);
        input.click();
    };


    const activeData = useMemo(() => {
        if (!data) return [];
        const today = new Date();
        return data.filter(p => !p.dataFim || isAfter(parseISO(p.dataFim), today));
    }, [data]);

    const mockInvoiceStatuses = useMockInvoiceStatus(activeData);

    const kpis = useMemo(() => {
        if (!data || data.length === 0) {
            return { headCount: 0, expiringSoon: 0, admitidosMes: 0, demitidosMes: 0, nfsPendentes: 0, nfsAtrasadas: 0, totalValidadoMes: 'R$ 0,00' };
        }

        const today = new Date();
        const startOfCurrentMonth = startOfMonth(today);

        const expiringSoon = activeData.filter(pj => {
            if (!pj.dataPrevistaPagamento) return false;
            try {
                const contractEndDate = parseISO(pj.dataPrevistaPagamento);
                return differenceInDays(contractEndDate, today) <= 30 && differenceInDays(contractEndDate, today) >= 0;
            } catch { return false; }
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
        
        // Novos KPIs de NF
        let nfsPendentes = 0;
        let nfsAtrasadas = 0;
        let totalValidadoMes = 0;
        
        activeData.forEach(pj => {
            const status = mockInvoiceStatuses[pj.cnpj];
            if (status === NFStatus.PENDENTE) nfsPendentes++;
            else if (status === NFStatus.ATRASADA) nfsAtrasadas++;
            else if (status === NFStatus.VALIDADA) {
                totalValidadoMes += parseFloat(pj.valorMensal);
            }
        });

        return {
            headCount: activeData.length,
            expiringSoon,
            admitidosMes,
            demitidosMes,
            nfsPendentes,
            nfsAtrasadas,
            totalValidadoMes: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValidadoMes)
        };
    }, [data, activeData, mockInvoiceStatuses]);

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Gestão PJ</h1>
                        <p className="text-gray-600 mt-1">Visão geral dos seus colaboradores Pessoa Jurídica.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                         <button onClick={handleExport} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"> <ExportIcon /> Exportar Dados </button>
                         <button onClick={triggerImport} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"> <ImportIcon /> Importar Dados </button>
                        <button onClick={copyLinkToClipboard} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"> <LinkIcon /> {copySuccess || 'Copiar Link de Cadastro'} </button>
                    </div>
                </header>
                
                {/* KPI Cards de Colaboradores */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Colaboradores</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <KPICard title="Head Count Ativo" value={kpis.headCount.toString()} />
                    <KPICard title="Contratos a Vencer (30d)" value={kpis.expiringSoon.toString()} />
                    <KPICard title="Admitidos no Mês" value={kpis.admitidosMes.toString()} />
                    <KPICard title="Demitidos no Mês" value={kpis.demitidosMes.toString()} />
                </div>

                 {/* KPI Cards de Notas Fiscais */}
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Notas Fiscais (Mês Atual)</h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Link to="/notas-fiscais"><KPICard title="NFs Pendentes" value={kpis.nfsPendentes.toString()} /></Link>
                    <Link to="/notas-fiscais"><KPICard title="NFs Atrasadas" value={kpis.nfsAtrasadas.toString()} /></Link>
                    <Link to="/notas-fiscais"><KPICard title="Total Validado no Mês" value={kpis.totalValidadoMes} /></Link>
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

            </main>
        </div>
    );
};

export default Dashboard;