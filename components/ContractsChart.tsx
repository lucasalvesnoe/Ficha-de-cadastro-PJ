import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { differenceInDays, parseISO } from 'date-fns';
import { FormData } from '../types';

interface ContractsChartProps {
    data: FormData[];
}

const ContractsChart: React.FC<ContractsChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const today = new Date();
        const bins = {
            'Próx. 30 dias': 0,
            '31-60 dias': 0,
            '61-90 dias': 0,
            '+90 dias': 0,
        };

        data.forEach(pj => {
            const endDate = parseISO(pj.dataPrevistaPagamento);
            const daysUntilEnd = differenceInDays(endDate, today);

            if (daysUntilEnd < 0) return; // Já venceu

            if (daysUntilEnd <= 30) {
                bins['Próx. 30 dias']++;
            } else if (daysUntilEnd <= 60) {
                bins['31-60 dias']++;
            } else if (daysUntilEnd <= 90) {
                bins['61-90 dias']++;
            } else {
                bins['+90 dias']++;
            }
        });

        return Object.entries(bins).map(([name, value]) => ({ name, 'Contratos': value }));
    }, [data]);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                        cursor={{ fill: 'rgba(200, 220, 240, 0.3)' }}
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <Bar dataKey="Contratos" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ContractsChart;
