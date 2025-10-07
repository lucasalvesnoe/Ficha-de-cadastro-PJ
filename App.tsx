import React, { useState, useCallback } from 'react';
import { FormData, UploadedFiles, FileCategory } from './types';
import TextInput from './components/TextInput';
import FileUpload from './components/FileUpload';

const initialFormData: FormData = {
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
  responsavelNomeCompleto: '',
  responsavelCpf: '',
  responsavelCargo: '',
  responsavelCelular: '',
  responsavelEmail: '',
  banco: '',
  agencia: '',
  conta: '',
  tipoConta: '',
  titularConta: '',
  dataInicio: '',
  gestorDireto: '',
  areaProjeto: '',
  valorMensal: '',
  formaPagamento: '',
  formaPagamentoOutro: '',
  dataLimiteNF: '',
  dataPrevistaPagamento: '',
  declaracao: false,
};

const initialFiles: UploadedFiles = {
  [FileCategory.CONTRATO_SOCIAL_MEI]: [],
  [FileCategory.GRADUACAO]: [],
  [FileCategory.CERTIFICACOES_POS_OUTROS]: [],
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [files, setFiles] = useState<UploadedFiles>(initialFiles);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
     if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleFileChange = useCallback((category: FileCategory) => (uploadedFiles: File[]) => {
    setFiles((prev) => ({ ...prev, [category]: uploadedFiles }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.declaracao) {
      alert("Você precisa aceitar a declaração para continuar.");
      return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const renderSuccessMessage = () => (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-2xl animate-fade-in">
        <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Cadastro Enviado com Sucesso!</h2>
            <p className="mt-2 text-sm text-gray-600">As informações foram recebidas e em breve entraremos em contato.</p>
        </div>
        <div className="mt-8 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">Simulação de Envio de E-mail</h3>
            <p className="text-xs text-gray-500 mb-2">Em uma aplicação real, os dados a seguir seriam enviados para <span className="font-medium">lucas.noe@intelliway.com.br</span>.</p>
            <pre className="bg-white border border-gray-200 text-gray-800 p-4 rounded-md text-xs overflow-x-auto">
                <code>
                    {JSON.stringify({
                        formData,
                        files: Object.fromEntries(
                          Object.entries(files).map(([category, fileList]) => [
                            category,
                            fileList.map(f => f.name)
                          ])
                        )
                    }, null, 2)}
                </code>
            </pre>
        </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {renderSuccessMessage()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Ficha de Cadastro – Colaborador PJ</h1>
          <p className="mt-3 text-lg text-gray-600">Intelliway Tecnologia</p>
        </header>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">1. Dados da Empresa (Pessoa Jurídica)</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextInput id="razaoSocial" name="razaoSocial" label="Razão Social" value={formData.razaoSocial} onChange={handleInputChange} required />
              <TextInput id="nomeFantasia" name="nomeFantasia" label="Nome Fantasia" value={formData.nomeFantasia} onChange={handleInputChange} required />
              <TextInput id="cnpj" name="cnpj" label="CNPJ" value={formData.cnpj} onChange={handleInputChange} required />
              <TextInput id="inscricaoEstadual" name="inscricaoEstadual" label="Inscrição Estadual (se houver)" value={formData.inscricaoEstadual} onChange={handleInputChange} />
              <div className="sm:col-span-2">
                <TextInput id="enderecoComercial" name="enderecoComercial" label="Endereço Comercial" value={formData.enderecoComercial} onChange={handleInputChange} required />
              </div>
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-5 gap-6">
                <div className="sm:col-span-3"><TextInput id="cidade" name="cidade" label="Cidade" value={formData.cidade} onChange={handleInputChange} required /></div>
                <div className="sm:col-span-1"><TextInput id="uf" name="uf" label="UF" value={formData.uf} onChange={handleInputChange} required /></div>
                <div className="sm:col-span-1"><TextInput id="cep" name="cep" label="CEP" value={formData.cep} onChange={handleInputChange} required /></div>
              </div>
              <TextInput id="telefoneComercial" name="telefoneComercial" type="tel" label="Telefone Comercial" value={formData.telefoneComercial} onChange={handleInputChange} required />
              <TextInput id="emailContato" name="emailContato" type="email" label="E-mail de Contato" value={formData.emailContato} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">2. Dados do Responsável Legal</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextInput id="responsavelNomeCompleto" name="responsavelNomeCompleto" label="Nome Completo" value={formData.responsavelNomeCompleto} onChange={handleInputChange} required />
              <TextInput id="responsavelCpf" name="responsavelCpf" label="CPF" value={formData.responsavelCpf} onChange={handleInputChange} required />
              <div className="sm:col-span-2"><TextInput id="responsavelCargo" name="responsavelCargo" label="Cargo/Função" value={formData.responsavelCargo} onChange={handleInputChange} required /></div>
              <TextInput id="responsavelCelular" name="responsavelCelular" type="tel" label="Celular/WhatsApp" value={formData.responsavelCelular} onChange={handleInputChange} required />
              <TextInput id="responsavelEmail" name="responsavelEmail" type="email" label="E-mail" value={formData.responsavelEmail} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">3. Dados Bancários para Pagamento</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextInput id="banco" name="banco" label="Banco" value={formData.banco} onChange={handleInputChange} required />
              <TextInput id="agencia" name="agencia" label="Agência" value={formData.agencia} onChange={handleInputChange} required />
              <TextInput id="conta" name="conta" label="Conta" value={formData.conta} onChange={handleInputChange} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Conta</label>
                <div className="flex items-center space-x-4">
                  {[{label: 'Corrente', value: 'corrente'}, {label: 'PJ', value: 'pj'}, {label: 'Digital', value: 'digital'}].map(opt => (
                    <label key={opt.value} className="flex items-center"><input type="radio" name="tipoConta" value={opt.value} checked={formData.tipoConta === opt.value} onChange={handleInputChange} className="h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-500" /><span className="ml-2 text-sm text-gray-700">{opt.label}</span></label>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2"><TextInput id="titularConta" name="titularConta" label="Titular da Conta" value={formData.titularConta} onChange={handleInputChange} required /></div>
            </div>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">4. Informações Contratuais</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <TextInput id="dataInicio" name="dataInicio" type="date" label="Data de Início na Intelliway" value={formData.dataInicio} onChange={handleInputChange} required />
              <TextInput id="gestorDireto" name="gestorDireto" label="Gestor Direto" value={formData.gestorDireto} onChange={handleInputChange} required />
              <TextInput id="areaProjeto" name="areaProjeto" label="Área/Projeto" value={formData.areaProjeto} onChange={handleInputChange} required />
              <TextInput id="valorMensal" name="valorMensal" label="Valor Mensal da Prestação de Serviços: R$" value={formData.valorMensal} onChange={handleInputChange} required />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                <div className="flex items-center space-x-4">
                  {[{label: 'PIX', value: 'pix'}, {label: 'Transferência', value: 'transferencia'}, {label: 'Outro', value: 'outro'}].map(opt => (
                    <label key={opt.value} className="flex items-center"><input type="radio" name="formaPagamento" value={opt.value} checked={formData.formaPagamento === opt.value} onChange={handleInputChange} className="h-4 w-4 text-cyan-600 border-gray-300 focus:ring-cyan-500" /><span className="ml-2 text-sm text-gray-700">{opt.label}</span></label>
                  ))}
                </div>
              </div>
              {formData.formaPagamento === 'outro' && (
                <div className="sm:col-span-2"><TextInput id="formaPagamentoOutro" name="formaPagamentoOutro" label="Qual?" value={formData.formaPagamentoOutro} onChange={handleInputChange} required /></div>
              )}
              <TextInput id="dataLimiteNF" name="dataLimiteNF" type="date" label="Data limite para envio da NF" value={formData.dataLimiteNF} onChange={handleInputChange} required />
              <TextInput id="dataPrevistaPagamento" name="dataPrevistaPagamento" type="date" label="Data prevista de pagamento" value={formData.dataPrevistaPagamento} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">5. Documentos Anexos (obrigatórios)</h2>
            <div className="space-y-6">
                <FileUpload id="contratoSocialMei" title="Contrato Social / MEI" onFilesChange={handleFileChange(FileCategory.CONTRATO_SOCIAL_MEI)} />
                <FileUpload id="graduacao" title="Graduação" onFilesChange={handleFileChange(FileCategory.GRADUACAO)} />
                <FileUpload id="certificacoesPosOutros" title="Certificações / Pós / Outros" onFilesChange={handleFileChange(FileCategory.CERTIFICACOES_POS_OUTROS)} />
            </div>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">6. Declaração</h2>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="declaracao" name="declaracao" type="checkbox" checked={formData.declaracao} onChange={handleInputChange} className="focus:ring-cyan-500 h-4 w-4 text-cyan-600 border-gray-300 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="declaracao" className="font-medium text-gray-700">
                  Declaro que as informações acima são verdadeiras e que estou ciente de que o pagamento dos serviços está condicionado à emissão da nota fiscal dentro do prazo estabelecido pela Intelliway Tecnologia.
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.declaracao}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? (
                <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Enviando...</>
              ) : 'Enviar Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
