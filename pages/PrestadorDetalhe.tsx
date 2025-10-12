import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePJData } from '../hooks/usePJData';
import { FormData, Reajuste, Documento, FileCategory } from '../types';
import Sidebar from '../components/Sidebar';
import TextInput from '../components/TextInput';
import SalaryEvolutionChart from '../components/SalaryEvolutionChart';
import DocumentViewer from '../components/DocumentViewer';
import FileUpload from '../components/FileUpload'; // Adicionado
import { format, parseISO } from 'date-fns';
import { GoogleGenAI } from '@google/genai';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

const initialNewReajusteState: Omit<Reajuste, 'valorAnterior'> = {
    data: '',
    novoValor: '',
    motivo: '',
};

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

const PrestadorDetalhe: React.FC = () => {
    const { cnpj } = useParams<{ cnpj: string }>();
    const navigate = useNavigate();
    const { data, loading, updatePJ } = usePJData();
    const [formData, setFormData] = useState<FormData | null>(null);
    const [newReajuste, setNewReajuste] = useState(initialNewReajusteState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [summary, setSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    useEffect(() => {
        if (!loading && data.length > 0) {
            const decodedCnpj = decodeURIComponent(cnpj || '');
            const pjData = data.find(p => p.cnpj === decodedCnpj);
            if (pjData) {
                setFormData(pjData);
            } else {
                navigate('/prestadores');
            }
        }
    }, [cnpj, data, loading, navigate]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => (prev ? { ...prev, [name]: value } : null));
    }, []);
    
    const handleNewReajusteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewReajuste(prev => ({ ...prev, [name]: value }));
    };

    const handleAddReajuste = () => {
        if (!newReajuste.data || !newReajuste.novoValor || !formData) {
            alert("Preencha a data e o novo valor para o reajuste.");
            return;
        }

        const reajusteToAdd: Reajuste = {
            ...newReajuste,
            valorAnterior: formData.valorMensal,
        };

        setFormData(prev => prev ? {
            ...prev,
            valorMensal: newReajuste.novoValor,
            historicoReajustes: [...(prev.historicoReajustes || []), reajusteToAdd],
        } : null);

        setNewReajuste(initialNewReajusteState);
    };

    const handleFileUpload = async (files: File[], category: FileCategory) => {
        if (files.length === 0 || !formData) return;
        const file = files[0];
        try {
            const base64Content = await fileToBase64(file);
            const newDocument: Documento = {
                nome: file.name,
                categoria: category,
                conteudo: base64Content,
                mimeType: file.type,
            };
            
            setFormData(prev => {
                if (!prev) return null;
                const existingDocs = prev.documentos || [];
                const updatedDocs = existingDocs.filter(d => d.categoria !== category);
                updatedDocs.push(newDocument);
                
                return { ...prev, documentos: updatedDocs };
            });

        } catch (error) {
            console.error("Erro ao processar arquivo:", error);
        }
    };

    const handleGenerateSummary = async () => {
        if (!formData) return;
        setIsGeneratingSummary(true);
        setSummary('');
        setSummaryError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const providerDataForAI = {
                nome: formData.responsavelNomeCompleto,
                cargo: formData.responsavelCargo,
                projeto: formData.areaProjeto,
                dataInicio: formData.dataInicio,
                valorMensal: formData.valorMensal,
                vencimentoContrato: formData.dataPrevistaPagamento,
                historicoReajustes: formData.historicoReajustes?.map(h => ({data: h.data, novoValor: h.novoValor}))
            };

            const contents = `Com base nos seguintes dados JSON, crie um parágrafo de resumo em português para este colaborador. Destaque sua função, projeto, data de início, valor mensal atual e data de vencimento do contrato. Seja direto e use um tom profissional. Os dados são: ${JSON.stringify(providerDataForAI)}`;
            
            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    systemInstruction: "Você é um assistente de RH especialista. Sua tarefa é criar um resumo conciso e profissional em português, baseado nos dados de um prestador de serviço fornecidos em formato JSON."
                }
            });

            setSummary(response.text);

        } catch (error) {
            console.error("Erro ao gerar resumo:", error);
            setSummaryError("Não foi possível gerar o resumo. Tente novamente.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData) return;
        
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        updatePJ(formData);
        setIsSubmitting(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    if (loading || !formData) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-100">
                <p>Carregando dados do prestador...</p>
            </div>
        );
    }

    const allDocCategories: { category: FileCategory, title: string }[] = [
        { category: FileCategory.CNPJ, title: 'Cartão CNPJ' },
        { category: FileCategory.CONTRATO_SOCIAL_MEI, title: 'Contrato Social / MEI' },
        { category: FileCategory.GRADUACAO, title: 'Diploma de Graduação' },
        { category: FileCategory.CERTIFICACOES_POS_OUTROS, title: 'Certificações / Outros' },
    ];

    const existingCategories = formData.documentos?.map(doc => doc.categoria) || [];
    const missingDocs = allDocCategories.filter(docInfo => !existingCategories.includes(docInfo.category));

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <div className="relative mb-6">
                     <button
                        onClick={() => navigate('/prestadores')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors"
                        aria-label="Voltar para a lista"
                    >
                        <ChevronLeftIcon />
                        Voltar
                    </button>
                    <header className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Ficha do Prestador</h1>
                        <p className="text-gray-600 mt-1">Veja ou edite as informações de {formData.responsavelNomeCompleto}</p>
                    </header>
                </div>
                
                 <div className="max-w-4xl mx-auto mb-6">
                    <div className="flex justify-end">
                         <button
                            type="button"
                            onClick={handleGenerateSummary}
                            disabled={isGeneratingSummary}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                            <SparklesIcon />
                            {isGeneratingSummary ? 'Gerando...' : 'Gerar Resumo com IA'}
                        </button>
                    </div>

                    {isGeneratingSummary && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg text-center text-gray-600">
                           <svg className="animate-spin h-5 w-5 text-cyan-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           <p className="mt-2 text-sm">Analisando dados...</p>
                        </div>
                    )}
                    {summaryError && <p className="mt-4 text-sm text-red-600 text-center">{summaryError}</p>}
                    {summary && (
                        <div className="mt-4 p-5 bg-cyan-50 border-l-4 border-cyan-500 rounded-r-lg">
                             <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center"><SparklesIcon /> Resumo da IA</h3>
                            <p className="text-gray-700 leading-relaxed">{summary}</p>
                        </div>
                    )}
                 </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
                    {/* Dados da Empresa */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">1. Dados da Empresa</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextInput id="razaoSocial" name="razaoSocial" label="Razão Social" value={formData.razaoSocial} onChange={handleInputChange} required />
                            <TextInput id="nomeFantasia" name="nomeFantasia" label="Nome Fantasia" value={formData.nomeFantasia} onChange={handleInputChange} required />
                            <TextInput id="cnpj" name="cnpj" label="CNPJ" value={formData.cnpj} onChange={() => {}} required disabled />
                             <TextInput id="inscricaoEstadual" name="inscricaoEstadual" label="Inscrição Estadual (se houver)" value={formData.inscricaoEstadual} onChange={handleInputChange} />
                            <div className="sm:col-span-2">
                                <TextInput id="enderecoComercial" name="enderecoComercial" label="Endereço Comercial" value={formData.enderecoComercial} onChange={handleInputChange} required />
                            </div>
                            <TextInput id="telefoneComercial" name="telefoneComercial" type="tel" label="Telefone Comercial" value={formData.telefoneComercial} onChange={handleInputChange} required />
                            <TextInput id="emailContato" name="emailContato" type="email" label="E-mail de Contato" value={formData.emailContato} onChange={handleInputChange} required />
                        </div>
                    </div>
                    
                    {/* Dados do Responsável */}
                     <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">2. Dados do Responsável Legal</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextInput id="responsavelNomeCompleto" name="responsavelNomeCompleto" label="Nome Completo" value={formData.responsavelNomeCompleto} onChange={handleInputChange} required />
                            <TextInput id="responsavelCpf" name="responsavelCpf" label="CPF" value={formData.responsavelCpf} onChange={() => {}} required disabled />
                             <TextInput id="dataNascimento" name="dataNascimento" type="date" label="Data de Nascimento" value={formData.dataNascimento} onChange={handleInputChange} required />
                            <TextInput id="responsavelCargo" name="responsavelCargo" label="Cargo/Função" value={formData.responsavelCargo} onChange={handleInputChange} required />
                            <TextInput id="responsavelCelular" name="responsavelCelular" type="tel" label="Celular/WhatsApp" value={formData.responsavelCelular} onChange={handleInputChange} required />
                            <TextInput id="responsavelEmail" name="responsavelEmail" type="email" label="E-mail" value={formData.responsavelEmail} onChange={handleInputChange} required />
                        </div>
                    </div>

                    {/* Informações Contratuais */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">3. Informações Contratuais</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextInput id="dataInicio" name="dataInicio" type="date" label="Data de Início" value={formData.dataInicio} onChange={handleInputChange} required />
                            <TextInput id="dataFim" name="dataFim" type="date" label="Data de Fim (se aplicável)" value={formData.dataFim || ''} onChange={handleInputChange} />
                            <TextInput id="gestorDireto" name="gestorDireto" label="Gestor Direto" value={formData.gestorDireto} onChange={handleInputChange} required />
                            <TextInput id="areaProjeto" name="areaProjeto" label="Área/Projeto" value={formData.areaProjeto} onChange={handleInputChange} required />
                            <TextInput id="centroCusto" name="centroCusto" label="Centro de Custo" value={formData.centroCusto} onChange={handleInputChange} required />
                            <TextInput id="dataPrevistaPagamento" name="dataPrevistaPagamento" type="date" label="Data de Vencimento do Contrato" value={formData.dataPrevistaPagamento} onChange={handleInputChange} required />
                        </div>
                    </div>
                    
                    {/* Salário e Histórico de Reajustes */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">4. Salário e Histórico de Reajustes</h2>
                         <div className="mb-6">
                             <TextInput id="valorMensal" name="valorMensal" label="Valor Mensal Atual (R$)" value={formData.valorMensal} onChange={handleInputChange} required />
                         </div>
                         
                         <div className="mb-8">
                             <h3 className="text-lg font-semibold text-gray-700 mb-4">Evolução Salarial</h3>
                             <SalaryEvolutionChart providerData={formData} />
                         </div>

                         <h3 className="text-lg font-semibold text-gray-700 mb-4">Histórico de Reajustes</h3>
                         <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Anterior</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Novo Valor</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {formData.historicoReajustes && formData.historicoReajustes.length > 0 ? (
                                        formData.historicoReajustes.map((r, index) => (
                                            <tr key={index}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{format(parseISO(r.data), 'dd/MM/yyyy')}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">R$ {r.valorAnterior}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 font-semibold">R$ {r.novoValor}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{r.motivo}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={4} className="text-center py-4 text-sm text-gray-500">Nenhum reajuste registrado.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Adicionar Novo Reajuste</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                                <TextInput id="dataReajuste" name="data" type="date" label="Data" value={newReajuste.data} onChange={handleNewReajusteChange} />
                                <TextInput id="novoValor" name="novoValor" label="Novo Valor (R$)" value={newReajuste.novoValor} onChange={handleNewReajusteChange} placeholder={formData.valorMensal} />
                                <div className="sm:col-span-2">
                                     <TextInput id="motivo" name="motivo" label="Motivo" value={newReajuste.motivo} onChange={handleNewReajusteChange} />
                                </div>
                            </div>
                             <div className="text-right mt-4">
                                <button type="button" onClick={handleAddReajuste} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Adicionar Reajuste</button>
                            </div>
                        </div>

                    </div>
                    
                    {/* Acervo de Documentos */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">5. Acervo de Documentos</h2>
                        <div className="space-y-4">
                            {(formData.documentos && formData.documentos.length > 0) ? (
                                formData.documentos.map((doc, index) => (
                                    <DocumentViewer key={index} documento={doc} />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-4">Nenhum documento foi anexado a este cadastro.</p>
                            )}
                        </div>

                        {missingDocs.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Anexar Documentos Pendentes</h3>
                                <div className="space-y-6">
                                    {missingDocs.map(docInfo => (
                                        <FileUpload
                                            key={docInfo.category}
                                            id={`upload-${docInfo.category}`}
                                            title={docInfo.title}
                                            onFilesChange={(files) => handleFileUpload(files, docInfo.category)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="flex justify-end pt-4 items-center gap-4">
                        {saveSuccess && (
                            <p className="text-green-600 font-medium text-sm transition-opacity duration-300">
                                Alterações salvas com sucesso!
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default PrestadorDetalhe;