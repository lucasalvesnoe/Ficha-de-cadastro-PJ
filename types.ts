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
  valorMensal: string;
  formaPagamento: 'pix' | 'transferencia' | 'outro' | '';
  formaPagamentoOutro: string;
  dataLimiteNF: string;
  dataPrevistaPagamento: string;
  
  // 6. Declaração
  declaracao: boolean;
}

export enum FileCategory {
  CONTRATO_SOCIAL_MEI = 'contratoSocialMei',
  GRADUACAO = 'graduacao',
  CERTIFICACOES_POS_OUTROS = 'certificacoesPosOutros',
}

export interface UploadedFiles {
  [FileCategory.CONTRATO_SOCIAL_MEI]: File[];
  [FileCategory.GRADUACAO]: File[];
  [FileCategory.CERTIFICACOES_POS_OUTROS]: File[];
}
