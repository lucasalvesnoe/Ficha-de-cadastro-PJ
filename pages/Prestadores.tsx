import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePJData } from '../hooks/usePJData';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Sidebar from '../components/Sidebar';

type NFStatus = 'Pendente' | 'Recebida' | 'Atrasada';

const Prestadores: React.FC = () => {
    const { data, loading } = usePJData();
    const navigate = useNavigate();
    const [nfStatus, setNfStatus] = useState<Record<string, NFStatus>>({});

    useEffect(() => {
        const initialState: Record<string, NFStatus> = {};
        data.forEach(pj => {
            initialState[pj.cnpj] = 'Pendente';
        });
        setNfStatus(initialState);
    }, [data]);

    const handleStatusChange = (cnpj: string, status: NFStatus, e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o clique no select propague para a linha
        setNfStatus(prev => ({ ...prev, [cnpj]: status }));
    };
    
    const handleRowClick = (cnpj: string) => {
        navigate(`/prestadores/${encodeURIComponent(cnpj)}`);
    };

    const getStatusColor = (status: NFStatus) => {
        switch (status) {
            case 'Recebida': return 'bg-green-100 text-green-800';
            case 'Atrasada': return 'bg-red-100 text-red-800';
            case 'Pendente':
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    if (loading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Lista de Prestadores de Serviço</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os seus colaboradores PJ em um só lugar.</p>
                </header>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Prestador</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro de Custo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venc. Contrato</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Off Restantes</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status NF (Mês Atual)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((pj) => (
                                    <tr key={pj.cnpj} onClick={() => handleRowClick(pj.cnpj)} className="hover:bg-slate-50 cursor-pointer transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{pj.responsavelNomeCompleto}</div>
                                            <div className="text-sm text-gray-500">{pj.emailContato}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pj.responsavelCargo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pj.centroCusto}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(parseISO(pj.dataPrevistaPagamento), 'dd/MM/yyyy', { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium text-center">
                                            {pj.daysOffRestantes ?? 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select
                                                value={nfStatus[pj.cnpj] || 'Pendente'}
                                                onChange={(e) => handleStatusChange(pj.cnpj, e.target.value as NFStatus, e as any)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`px-2 py-1 text-xs font-semibold rounded-full border-none focus:ring-2 focus:ring-cyan-500 ${getStatusColor(nfStatus[pj.cnpj] || 'Pendente')}`}
                                            >
                                                <option value="Pendente">Pendente</option>
                                                <option value="Recebida">Recebida</option>
                                                <option value="Atrasada">Atrasada</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Prestadores;
