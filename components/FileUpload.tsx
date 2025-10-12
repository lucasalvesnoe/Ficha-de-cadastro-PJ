import React, { useState, useRef, useCallback } from 'react';

interface FileUploadProps {
  id: string;
  title: string;
  onFilesChange: (files: File[]) => void;
  isAnalyzing?: boolean;
  analysisError?: string;
  analysisMessage?: string;
}

const FileUploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" />
    </svg>
);

const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);


const FileUpload: React.FC<FileUploadProps> = ({ id, title, onFilesChange, isAnalyzing = false, analysisError = '', analysisMessage = 'Analisando documento...' }) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      // For simplicity in this use case, we replace the file instead of appending
      setFiles(newFiles);
      onFilesChange(newFiles);
    }
  };

  const triggerFileSelect = useCallback(() => {
    if (isAnalyzing) return;
    fileInputRef.current?.click();
  }, [isAnalyzing]);
  
  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div 
            onClick={triggerFileSelect}
            className={`bg-slate-50 p-6 rounded-lg border-2 border-dashed border-slate-300 text-center transition-colors duration-200 ${isAnalyzing ? 'cursor-not-allowed bg-slate-200' : 'cursor-pointer hover:bg-slate-100 hover:border-cyan-500'}`}
            role="button"
            aria-labelledby={`${id}-label`}
        >
            {isAnalyzing ? (
                <div className="h-24 flex flex-col justify-center items-center">
                    <svg className="animate-spin h-8 w-8 text-cyan-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-3 text-sm text-cyan-700 font-medium">{analysisMessage}</p>
                </div>
            ) : (
                <div className="h-24 flex flex-col justify-center items-center">
                    <FileUploadIcon className="w-10 h-10 mx-auto text-gray-400" />
                    <p id={`${id}-label`} className="mt-2 text-sm text-gray-600">
                        <span className="font-semibold text-cyan-600">Clique para enviar</span> ou arraste
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG</p>
                </div>
            )}
             <input
                type="file"
                id={id}
                multiple={false} // Only allow one file for AI analysis at a time
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={isAnalyzing}
            />
        </div>

        {analysisError && <p className="text-sm text-red-600 mt-2 text-center">{analysisError}</p>}
      
      {files.length > 0 && !isAnalyzing && (
        <div className="mt-4 space-y-2">
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
            {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="px-3 py-2 flex items-center justify-between text-sm">
                <div className="flex items-center min-w-0">
                    <FileIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-800 truncate" title={file.name}>{file.name}</span>
                </div>
                <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-4 text-red-500 hover:text-red-700 font-bold transition-colors"
                    aria-label={`Remover ${file.name}`}
                >
                    &times;
                </button>
                </li>
            ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;