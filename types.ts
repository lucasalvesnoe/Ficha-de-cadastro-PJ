
export interface Reajuste {
  data: string;
  valorAnterior: string;
  novoValor: string;
  motivo: string;
}

export enum FileCategory {
  CONTRATO_SOCIAL_MEI = 'contratoSocialMei',
  CNPJ = 'cnpj',
  GRADUACAO = 'graduacao',
  CERTIFICACOES_POS_OUTROS = 'certificacoesPosOutros',
  NOTA_FISCAL = 'notaFiscal', // Novo
}

export enum NFStatus {
  PENDENTE = 'Pendente',
  ATRASADA = 'Atrasada',
  EM_ANALISE = 'Em Análise',
  VALIDADA = 'Validada com IA',
  ERRO_VALIDACAO = 'Erro de Validação',
}


export interface InvoiceState {
    status: NFStatus;
    errorMessage?: string;
    validatedData?: {
        cnpj: string;
        valor: string;
        dataEmissao: string;
    }
}

export interface Documento {
  nome: string;
  categoria: FileCategory;
  conteudo: string; // Base64 encoded content
  mimeType: string;
}

export interface FormData {
  // 1. Dados da Empresa
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  enderecoComercial: string;
  cidade: string;
  uf: string;
  cep: string;
  telefoneComercial: string;
  emailContato: string;

  // 2. Dados do Responsável Legal
  responsavelNomeCompleto: string;
  responsavelCpf: string;
  dataNascimento: string;
  responsavelCargo: string;
  responsavelCelular: string;
  responsavelEmail: string;

  // 3. Dados Bancários
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: 'corrente' | 'pj' | 'digital' | '';
  titularConta: string;

  // 4. Informações Contratuais
  dataInicio: string;
  gestorDireto: string;
  areaProjeto: string;
  centroCusto: string;
  valorMensal: string;
  formaPagamento: 'pix' | 'transferencia' | 'outro' | '';
  formaPagamentoOutro: string;
  dataLimiteNF: string;
  dataPrevistaPagamento: string;
  dataFim?: string | null;
  daysOffRestantes?: number;
  
  // 5. Histórico de Reajustes
  historicoReajustes?: Reajuste[];

  // 6. Documentos
  documentos?: Documento[];

  // 7. Declaração
  declaracao: boolean;
}


export interface UploadedFiles {
  [FileCategory.CONTRATO_SOCIAL_MEI]: File[];
  [FileCategory.CNPJ]: File[];
  [FileCategory.GRADUACAO]: File[];
  [FileCategory.CERTIFICACOES_POS_OUTROS]: File[];
}