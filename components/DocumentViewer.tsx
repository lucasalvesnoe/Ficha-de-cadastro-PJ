import React from 'react';
import { Documento, FileCategory } from '../types';

const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


interface DocumentViewerProps {
    documento: Documento;
}

const getCategoryLabel = (category: FileCategory): string => {
    switch (category) {
        case FileCategory.CONTRATO_SOCIAL_MEI:
            return 'Contrato Social / MEI';
        case FileCategory.CNPJ:
            return 'Cartão CNPJ';
        case FileCategory.GRADUACAO:
            return 'Diploma de Graduação';
        case FileCategory.CERTIFICACOES_POS_OUTROS:
            return 'Certificações / Outros';
        default:
            return 'Documento';
    }
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documento }) => {
    const dataUrl = `data:${documento.mimeType};base64,${documento.conteudo}`;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = documento.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleView = () => {
        // Para PDFs, é mais robusto usar um Blob e Object URL
        if (documento.mimeType === 'application/pdf') {
            try {
                const byteCharacters = atob(documento.conteudo);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const objectUrl = URL.createObjectURL(blob);
                
                window.open(objectUrl, '_blank', 'noopener,noreferrer');
                // O navegador revogará o URL do objeto quando a aba for fechada.
            } catch (error) {
                console.error("Erro ao criar visualização do PDF:", error);
                // Fallback para o método original se algo der errado
                window.open(dataUrl, '_blank', 'noopener,noreferrer');
            }
        } else {
            // Para imagens, a URL de dados direta geralmente funciona bem.
            window.open(dataUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center min-w-0">
                <FileIcon className="w-8 h-8 text-cyan-500 mr-4 flex-shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{getCategoryLabel(documento.categoria)}</p>
                    <p className="text-xs text-gray-500 truncate" title={documento.nome}>{documento.nome}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                <button
                    onClick={handleView}
                    className="p-2 text-gray-500 hover:bg-slate-200 hover:text-cyan-600 rounded-full transition-colors"
                    aria-label={`Visualizar ${documento.nome}`}
                >
                    <EyeIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={handleDownload}
                    className="p-2 text-gray-500 hover:bg-slate-200 hover:text-cyan-600 rounded-full transition-colors"
                    aria-label={`Baixar ${documento.nome}`}
                >
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default DocumentViewer;