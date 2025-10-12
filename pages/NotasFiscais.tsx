import React, { useState, useEffect, useMemo } from 'react';
import { usePJData } from '../hooks/usePJData';
import { FormData, NFStatus, InvoiceState } from '../types';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { format, isAfter, isBefore, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GoogleGenAI, Type } from '@google/genai';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
    };
    reader.onerror = (error) => reject(error);
  });

const NotasFiscais: React.FC = () => {
    const { data, loading } = usePJData();
    const [invoiceStatuses, setInvoiceStatuses] = useState<Record<string, InvoiceState>>({});

    const activeData = useMemo(() => {
        if (!data) return [];
        const today = new Date();
        return data.filter(p => !p.dataFim || isAfter(parseISO(p.dataFim), today));
    }, [data]);
    
    useEffect(() => {
        const today = startOfToday();
        const initialStatuses: Record<string, InvoiceState> = {};
        activeData.forEach(pj => {
            const limitDate = parseISO(pj.dataLimiteNF);
            const isLate = isBefore(limitDate, today);
            initialStatuses[pj.cnpj] = {
                status: isLate ? NFStatus.ATRASADA : NFStatus.PENDENTE
            };
        });
        setInvoiceStatuses(initialStatuses);
    }, [activeData]);


    const handleInvoiceUpload = async (files: File[], pj: FormData) => {
        const file = files[0];
        if (!file) return;

        setInvoiceStatuses(prev => ({ ...prev, [pj.cnpj]: { status: NFStatus.EM_ANALISE } }));

        try {
            const base64Data = await fileToBase64(file);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const imagePart = { inlineData: { mimeType: file.type, data: base64Data } };
            const textPart = { text: 'Extraia o CNPJ do emissor, o valor total da nota e a data de emissão. Formate a data como AAAA-MM-DD. O valor deve ser um número, sem R$.' };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            cnpj: { type: Type.STRING },
                            valor: { type: Type.NUMBER },
                            dataEmissao: { type: Type.STRING },
                        }
                    }
                }
            });

            const extractedData = JSON.parse(response.text);
            const extractedCnpj = extractedData.cnpj.replace(/[^\d]/g, '');
            const registeredCnpj = pj.cnpj.replace(/[^\d]/g, '');
            const extractedValue = parseFloat(extractedData.valor);
            const registeredValue = parseFloat(pj.valorMensal);

            if (extractedCnpj !== registeredCnpj) {
                throw new Error(`CNPJ da NF (${extractedData.cnpj}) não corresponde ao cadastrado (${pj.cnpj}).`);
            }
            if (Math.abs(extractedValue - registeredValue) > 0.01) { // Compare floats
                throw new Error(`Valor da NF (R$ ${extractedValue.toFixed(2)}) não corresponde ao cadastrado (R$ ${registeredValue.toFixed(2)}).`);
            }
            
            setInvoiceStatuses(prev => ({
                ...prev,
                [pj.cnpj]: { status: NFStatus.VALIDADA, validatedData: extractedData }
            }));

        } catch (error: any) {
            console.error("Erro na validação da NF:", error);
            setInvoiceStatuses(prev => ({
                ...prev,
                [pj.cnpj]: { status: NFStatus.ERRO_VALIDACAO, errorMessage: error.message || 'Falha ao analisar o documento.' }
            }));
        }
    };
    
    const handleRemind = (pj: FormData) => {
        const subject = "Lembrete: Envio de Nota Fiscal - Intelliway";
        const body = `Olá, ${pj.responsavelNomeCompleto},
        
Tudo bem?
        
Este é um lembrete amigável sobre o envio da sua nota fiscal de prestação de serviços para este mês.
A data limite para envio é ${format(parseISO(pj.dataLimiteNF), 'dd/MM/yyyy')}.

Por favor, realize o envio assim que possível para garantir que o processo de pagamento ocorra dentro do prazo.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Intelliway`;

        window.location.href = `mailto:${pj.responsavelEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const getStatusColor = (status: NFStatus) => {
        switch (status) {
            case NFStatus.VALIDADA: return 'bg-green-100 text-green-800';
            case NFStatus.ATRASADA:
            case NFStatus.ERRO_VALIDACAO: return 'bg-red-100 text-red-800';
            case NFStatus.EM_ANALISE: return 'bg-blue-100 text-blue-800';
            case NFStatus.PENDENTE:
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
                    <h1 className="text-3xl font-bold text-gray-900">Central de Notas Fiscais</h1>
                    <p className="text-gray-600 mt-1">Valide e gerencie as NFs dos seus prestadores com assistência da IA.</p>
                </header>

                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prestador</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Contratual</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Limite NF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status NF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activeData.map((pj) => {
                                    const currentStatus = invoiceStatuses[pj.cnpj] || { status: NFStatus.PENDENTE };
                                    const isActionable = currentStatus.status === NFStatus.PENDENTE || currentStatus.status === NFStatus.ATRASADA || currentStatus.status === NFStatus.ERRO_VALIDACAO;

                                    return (
                                    <tr key={pj.cnpj} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{pj.responsavelNomeCompleto}</div>
                                            <div className="text-sm text-gray-500">{pj.responsavelCargo}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(pj.valorMensal))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(parseISO(pj.dataLimiteNF), 'dd/MM/yyyy', { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(currentStatus.status)}`}>
                                                {currentStatus.status}
                                            </span>
                                            {currentStatus.status === NFStatus.ERRO_VALIDACAO && <p className="text-xs text-red-600 mt-1 max-w-xs">{currentStatus.errorMessage}</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                            {currentStatus.status === NFStatus.EM_ANALISE ? (
                                                <span className="text-sm text-blue-600">Analisando...</span>
                                            ) : isActionable ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <label className="cursor-pointer text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md px-3 py-2 transition-colors">
                                                        Analisar NF
                                                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => e.target.files && handleInvoiceUpload(Array.from(e.target.files), pj)} />
                                                    </label>
                                                    <button onClick={() => handleRemind(pj)} className="text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md px-3 py-2 transition-colors">
                                                        Lembrar
                                                    </button>
                                                </div>
                                            ) : currentStatus.status === NFStatus.VALIDADA ? (
                                                <div className="text-green-600 text-sm font-semibold">✓ Validado</div>
                                            ) : null}
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotasFiscais;