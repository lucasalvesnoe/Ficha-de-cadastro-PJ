import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePJData } from '../hooks/usePJData';
import { FormData, Documento, FileCategory } from '../types';
import TextInput from '../components/TextInput';
import FileUpload from '../components/FileUpload';
import Sidebar from '../components/Sidebar';
import { GoogleGenAI, Type } from '@google/genai';

const initialState: FormData = {
    // 1. Dados da Empresa
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    enderecoComercial: '',
    cidade: '',
    uf: '',
    cep: '',
    telefoneComercial: '',
    emailContato: '',

    // 2. Dados do Responsável Legal
    responsavelNomeCompleto: '',
    responsavelCpf: '',
    dataNascimento: '',
    responsavelCargo: '',
    responsavelCelular: '',
    responsavelEmail: '',

    // 3. Dados Bancários
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: '',
    titularConta: '',

    // 4. Informações Contratuais
    dataInicio: '',
    gestorDireto: '',
    areaProjeto: '',
    centroCusto: '',
    valorMensal: '',
    formaPagamento: '',
    formaPagamentoOutro: '',
    dataLimiteNF: '',
    dataPrevistaPagamento: '',
    daysOffRestantes: 15,
    historicoReajustes: [],

    // 6. Documentos
    documentos: [],

    // 7. Declaração
    declaracao: false,
};

// Helper to convert file to base64
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

const Cadastro: React.FC = () => {
    const navigate = useNavigate();
    const { addPJ } = usePJData();
    const [formData, setFormData] = useState<FormData>(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // States for AI analysis
    const [isAnalyzingCNPJ, setIsAnalyzingCNPJ] = useState(false);
    const [analysisErrorCNPJ, setAnalysisErrorCNPJ] = useState('');
    const [isAnalyzingContract, setIsAnalyzingContract] = useState(false);
    const [analysisErrorContract, setAnalysisErrorContract] = useState('');
    const [analysisMessage, setAnalysisMessage] = useState('');


     // Generic handler for non-AI file uploads
    const handleFilePersistence = async (files: File[], category: FileCategory) => {
        if (files.length === 0) return;
        const file = files[0];
        try {
            const base64Content = await fileToBase64(file);
            const newDocument: Documento = {
                nome: file.name,
                categoria: category,
                conteudo: base64Content,
                mimeType: file.type,
            };
            // Remove existing doc of the same category before adding new one
            setFormData(prev => ({
                ...prev,
                documentos: [...(prev.documentos || []).filter(d => d.categoria !== category), newDocument],
            }));
        } catch (error) {
            console.error("Error processing file for persistence:", error);
        }
    };

    // Generic function to handle AI-powered document analysis AND file persistence
    const handleDocumentAnalysis = async (
        file: File,
        category: FileCategory,
        promptText: string,
        schema: any,
        setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>,
        setAnalysisError: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setIsAnalyzing(true);
        setAnalysisError('');

        const messages = ["Extraindo conteúdo...", "Conferindo informações...", "Só um instantinho..."];
        let messageIndex = 0;
        setAnalysisMessage(messages[messageIndex]);

        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setAnalysisMessage(messages[messageIndex]);
        }, 2500);

        try {
            const base64Data = await fileToBase64(file);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const imagePart = {
                inlineData: { mimeType: file.type, data: base64Data },
            };

            const textPart = { text: promptText };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                }
            });
            
            const extractedData = JSON.parse(response.text);
            
            const newDocument: Documento = {
                nome: file.name,
                categoria: category,
                conteudo: base64Data,
                mimeType: file.type,
            };
            
            // Schedule the form data update to occur after the current render cycle.
            // This ensures the browser has time to process the re-enabling of the inputs before filling them.
            setTimeout(() => {
                 setFormData(prev => ({ 
                    ...prev, 
                    ...extractedData,
                    documentos: [...(prev.documentos || []).filter(d => d.categoria !== category), newDocument],
                }));
            }, 50);


        } catch (error)
        {
            console.error("Erro ao analisar documento:", error);
            setAnalysisError('Falha ao extrair dados. Por favor, preencha manualmente.');
        } finally {
            clearInterval(intervalId);
            // This will trigger the first render to re-enable inputs
            setIsAnalyzing(false);
            setAnalysisMessage('');
        }
    };

    const handleCnpjFileChange = (newFiles: File[]) => {
        const file = newFiles[0];
        if (!file) return;

        const prompt = 'Analise a imagem deste Cartão CNPJ e extraia as informações de Razão Social, Nome Fantasia, CNPJ, Endereço Completo (logradouro e número), Cidade, UF e CEP. Retorne os dados em formato JSON.';
        const schema = {
            type: Type.OBJECT,
            properties: {
                razaoSocial: { type: Type.STRING },
                nomeFantasia: { type: Type.STRING },
                cnpj: { type: Type.STRING },
                enderecoComercial: { type: Type.STRING },
                cidade: { type: Type.STRING },
                uf: { type: Type.STRING },
                cep: { type: Type.STRING },
            },
        };
        handleDocumentAnalysis(file, FileCategory.CNPJ, prompt, schema, setIsAnalyzingCNPJ, setAnalysisErrorCNPJ);
    };
    
    const handleContractFileChange = (newFiles: File[]) => {
        const file = newFiles[0];
        if (!file) return;

        const prompt = 'Analise este documento (Contrato Social ou Certificado MEI). Localize e extraia os dados da empresa e, com especial atenção, os dados do sócio-administrador ou responsável legal. É crucial que você encontre o nome completo, CPF e data de nascimento do responsável. Se a data de nascimento não estiver explícita, procure pela data de nascimento em cláusulas de qualificação dos sócios. Retorne todos os dados em formato JSON, com a data no formato AAAA-MM-DD.';
        const schema = {
            type: Type.OBJECT,
            properties: {
                razaoSocial: { type: Type.STRING, description: 'Razão social completa da empresa.' },
                cnpj: { type: Type.STRING, description: 'Número do CNPJ da empresa, formatado.' },
                enderecoComercial: { type: Type.STRING, description: 'Endereço completo da sede da empresa.' },
                cidade: { type: Type.STRING, description: 'Cidade da sede da empresa.' },
                uf: { type: Type.STRING, description: 'Sigla do estado (UF) da sede da empresa.' },
                cep: { type: Type.STRING, description: 'CEP do endereço da empresa.' },
                responsavelNomeCompleto: { type: Type.STRING, description: 'Nome completo do sócio-administrador ou responsável legal.' },
                responsavelCpf: { type: Type.STRING, description: 'CPF do responsável legal.' },
                dataNascimento: { type: Type.STRING, description: 'Data de nascimento do responsável legal, no formato AAAA-MM-DD.' },
            },
        };
        handleDocumentAnalysis(file, FileCategory.CONTRATO_SOCIAL_MEI, prompt, schema, setIsAnalyzingContract, setAnalysisErrorContract);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.declaracao) {
            alert('Você deve concordar com a declaração para prosseguir.');
            return;
        }

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        addPJ(formData);
        setIsSubmitting(false);

        alert('Cadastro realizado com sucesso!');
        navigate('/dashboard');
    };
    
    const isAnalyzing = isAnalyzingCNPJ || isAnalyzingContract;

    return (
        <div className="flex h-screen bg-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <header className="text-center mb-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Cadastro de Prestador (PJ)</h1>
                    <p className="mt-3 text-lg text-gray-600">Um processo de homologação simples e inteligente.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">

                    {/* Onboarding Inteligente com IA */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border-t-4 border-cyan-500">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Onboarding Inteligente com IA</h2>
                        <p className="text-gray-600 mb-6">Comece por aqui! Envie o Cartão CNPJ e o Contrato Social da sua empresa. Nossa IA irá ler os documentos e preencher os campos do formulário para você, agilizando todo o processo.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FileUpload
                                id="cnpj-upload"
                                title="1. Cartão CNPJ"
                                onFilesChange={handleCnpjFileChange}
                                isAnalyzing={isAnalyzingCNPJ}
                                analysisError={analysisErrorCNPJ}
                                analysisMessage={isAnalyzingCNPJ ? analysisMessage : ''}
                            />
                             <FileUpload 
                                id="contratoSocialMei" 
                                title="2. Contrato Social ou MEI" 
                                onFilesChange={handleContractFileChange}
                                isAnalyzing={isAnalyzingContract}
                                analysisError={analysisErrorContract}
                                analysisMessage={isAnalyzingContract ? analysisMessage : ''}
                            />
                        </div>
                    </div>


                    {/* 1. Dados da Empresa e Responsável Legal */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">1. Dados da Empresa e Responsável Legal</h2>
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                             <h3 className="sm:col-span-2 text-base font-semibold text-gray-600 -mb-2">Dados da Empresa</h3>
                            <TextInput id="razaoSocial" name="razaoSocial" label="Razão Social" value={formData.razaoSocial} onChange={handleChange} required disabled={isAnalyzing} />
                            <TextInput id="nomeFantasia" name="nomeFantasia" label="Nome Fantasia" value={formData.nomeFantasia} onChange={handleChange} required disabled={isAnalyzing}/>
                            <TextInput id="cnpj" name="cnpj" label="CNPJ" value={formData.cnpj} onChange={handleChange} required placeholder="00.000.000/0000-00" disabled={isAnalyzing}/>
                            <TextInput id="inscricaoEstadual" name="inscricaoEstadual" label="Inscrição Estadual (se houver)" value={formData.inscricaoEstadual} onChange={handleChange} disabled={isAnalyzing}/>
                            <div className="sm:col-span-2">
                                <TextInput id="enderecoComercial" name="enderecoComercial" label="Endereço Comercial Completo" value={formData.enderecoComercial} onChange={handleChange} required disabled={isAnalyzing}/>
                            </div>
                            <TextInput id="cidade" name="cidade" label="Cidade" value={formData.cidade} onChange={handleChange} required disabled={isAnalyzing}/>
                            <TextInput id="uf" name="uf" label="UF" value={formData.uf} onChange={handleChange} required placeholder="Ex: SP" disabled={isAnalyzing}/>
                            <TextInput id="cep" name="cep" label="CEP" value={formData.cep} onChange={handleChange} required placeholder="00000-000" disabled={isAnalyzing}/>
                            <TextInput id="telefoneComercial" name="telefoneComercial" type="tel" label="Telefone Comercial" value={formData.telefoneComercial} onChange={handleChange} required />
                            <TextInput id="emailContato" name="emailContato" type="email" label="E-mail de Contato da Empresa" value={formData.emailContato} onChange={handleChange} required />
                       
                            <div className="sm:col-span-2 border-t mt-4 pt-6">
                                <h3 className="text-base font-semibold text-gray-600 -mb-2">Dados do Responsável Legal</h3>
                            </div>
                            <TextInput id="responsavelNomeCompleto" name="responsavelNomeCompleto" label="Nome Completo" value={formData.responsavelNomeCompleto} onChange={handleChange} required disabled={isAnalyzing} />
                            <TextInput id="responsavelCpf" name="responsavelCpf" label="CPF" value={formData.responsavelCpf} onChange={handleChange} required placeholder="000.000.000-00" disabled={isAnalyzing} />
                            <TextInput id="dataNascimento" name="dataNascimento" type="date" label="Data de Nascimento" value={formData.dataNascimento} onChange={handleChange} required disabled={isAnalyzing} />
                            <TextInput id="responsavelCargo" name="responsavelCargo" label="Cargo/Função" value={formData.responsavelCargo} onChange={handleChange} required />
                            <TextInput id="responsavelCelular" name="responsavelCelular" type="tel" label="Celular/WhatsApp" value={formData.responsavelCelular} onChange={handleChange} required />
                            <TextInput id="responsavelEmail" name="responsavelEmail" type="email" label="E-mail Pessoal" value={formData.responsavelEmail} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* 2. Dados Bancários */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">2. Dados Bancários</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextInput id="banco" name="banco" label="Banco (Nome e Código)" value={formData.banco} onChange={handleChange} required placeholder="Ex: 341 - Itaú Unibanco S.A." />
                            <TextInput id="agencia" name="agencia" label="Agência" value={formData.agencia} onChange={handleChange} required />
                            <TextInput id="conta" name="conta" label="Conta com dígito" value={formData.conta} onChange={handleChange} required />
                            <div>
                                <label htmlFor="tipoConta" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta <span className="text-red-500 ml-1">*</span></label>
                                <select id="tipoConta" name="tipoConta" value={formData.tipoConta} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm">
                                    <option value="">Selecione...</option>
                                    <option value="corrente">Corrente</option>
                                    <option value="pj">PJ</option>
                                    <option value="digital">Digital</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <TextInput id="titularConta" name="titularConta" label="Titular da Conta (Nome/Razão Social e CPF/CNPJ)" value={formData.titularConta} onChange={handleChange} required />
                            </div>
                        </div>
                    </div>
                    
                    {/* 3. Informações Contratuais */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">3. Informações Contratuais</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextInput id="dataInicio" name="dataInicio" type="date" label="Data de Início das Atividades" value={formData.dataInicio} onChange={handleChange} required />
                            <TextInput id="gestorDireto" name="gestorDireto" label="Gestor Direto na Intelliway" value={formData.gestorDireto} onChange={handleChange} required />
                            <TextInput id="areaProjeto" name="areaProjeto" label="Área/Projeto" value={formData.areaProjeto} onChange={handleChange} required />
                            <TextInput id="centroCusto" name="centroCusto" label="Centro de Custo" value={formData.centroCusto} onChange={handleChange} required />
                            <TextInput id="valorMensal" name="valorMensal" label="Valor Mensal do Contrato (R$)" value={formData.valorMensal} onChange={handleChange} required placeholder="Ex: 10000.00"/>
                            <div>
                                <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento <span className="text-red-500 ml-1">*</span></label>
                                <select id="formaPagamento" name="formaPagamento" value={formData.formaPagamento} onChange={handleChange} required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm">
                                    <option value="">Selecione...</option>
                                    <option value="pix">PIX</option>
                                    <option value="transferencia">Transferência Bancária</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            {formData.formaPagamento === 'outro' && (
                                <TextInput id="formaPagamentoOutro" name="formaPagamentoOutro" label="Qual?" value={formData.formaPagamentoOutro} onChange={handleChange} required />
                            )}
                            <TextInput id="dataLimiteNF" name="dataLimiteNF" type="date" label="Data Limite para Envio da NF" value={formData.dataLimiteNF} onChange={handleChange} required />
                            <TextInput id="dataPrevistaPagamento" name="dataPrevistaPagamento" type="date" label="Previsão de Vencimento do Contrato" value={formData.dataPrevistaPagamento} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* 4. Upload de Documentos Adicionais */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">4. Upload de Documentos Adicionais</h2>
                        <div className="space-y-6">
                            <FileUpload id="graduacao" title="Diploma de Graduação" onFilesChange={(files) => handleFilePersistence(files, FileCategory.GRADUACAO)} />
                            <FileUpload id="certificacoes" title="Certificações, Pós-graduação, etc." onFilesChange={(files) => handleFilePersistence(files, FileCategory.CERTIFICACOES_POS_OUTROS)} />
                        </div>
                    </div>
                    
                    {/* 5. Declaração */}
                    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">5. Declaração</h2>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="declaracao"
                                    name="declaracao"
                                    type="checkbox"
                                    checked={formData.declaracao}
                                    onChange={handleChange}
                                    className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border--gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="declaracao" className="font-medium text-gray-700">
                                    Declaro que todas as informações fornecidas são verdadeiras e precisas.
                                </label>
                                <p className="text-gray-500">Ao marcar esta caixa, você concorda com os termos de prestação de serviço e a política de privacidade da empresa.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.declaracao}
                                className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? 'Enviando...' : 'Finalizar Cadastro'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Cadastro;