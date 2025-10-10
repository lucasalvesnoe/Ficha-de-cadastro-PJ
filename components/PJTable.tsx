import React, { useState, useEffect } from 'react';
import { FormData } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PJTableProps {
    data: FormData[];
}

type NFStatus = 'Pendente' | 'Recebida' | 'Atrasada';

const PJTable: React.FC<PJTableProps> = ({ data }) => {
    // Simula o estado do recebimento das NFs
    const [nfStatus, setNfStatus] = useState<Record<string, NFStatus>>({});

    useEffect(() => {
        const initialState: Record<string, NFStatus> = {};
        data.forEach(pj => {
            initialState[pj.cnpj] = 'Pendente'; // Estado inicial
        });
        setNfStatus(initialState);
    }, [data]);


    const handleStatusChange = (cnpj: string, status: NFStatus) => {
        setNfStatus(prev => ({ ...prev, [cnpj]: status }));
    };

    const getStatusColor = (status: NFStatus) => {
        switch (status) {
            case 'Recebida': return 'bg-green-100 text-green-800';
            case 'Atrasada': return 'bg-red-100 text-red-800';
            case 'Pendente':
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Controle de Notas Fiscais</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gestor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venc. Contrato</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status NF (Mês Atual)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((pj) => (
                            <tr key={pj.cnpj} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{pj.responsavelNomeCompleto}</div>
                                    <div className="text-sm text-gray-500">{pj.responsavelCargo}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pj.areaProjeto}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pj.gestorDireto}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(parseISO(pj.dataPrevistaPagamento), 'dd/MM/yyyy', { locale: ptBR })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <select
                                        value={nfStatus[pj.cnpj] || 'Pendente'}
                                        onChange={(e) => handleStatusChange(pj.cnpj, e.target.value as NFStatus)}
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
    );
};

export default PJTable;