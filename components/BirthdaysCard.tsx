import React, { useMemo } from 'react';
import { isSameMonth, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FormData } from '../types';

interface BirthdaysCardProps {
    data: FormData[];
}

const CakeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15.25v-3.25a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v3.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21v-5.25m0 0a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 0V2.25" />
    </svg>
);


const BirthdaysCard: React.FC<BirthdaysCardProps> = ({ data }) => {
    const birthdays = useMemo(() => {
        const today = new Date();
        return data
            .filter(pj => pj.dataNascimento && isSameMonth(parseISO(pj.dataNascimento), today))
            .sort((a, b) => parseISO(a.dataNascimento).getDate() - parseISO(b.dataNascimento).getDate());
    }, [data]);

    return (
        <>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CakeIcon />
                Aniversariantes do Mês
            </h2>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {birthdays.length > 0 ? (
                    birthdays.map(pj => (
                        <div key={pj.cnpj} className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                            <span className="text-sm font-medium text-gray-800">{pj.responsavelNomeCompleto}</span>
                            <span className="text-sm font-bold text-cyan-600">
                                {format(parseISO(pj.dataNascimento), 'dd/MM', { locale: ptBR })}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhum aniversariante este mês.</p>
                )}
            </div>
        </>
    );
};

export default BirthdaysCard;