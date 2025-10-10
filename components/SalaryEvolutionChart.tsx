import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FormData } from '../types';

interface SalaryEvolutionChartProps {
    providerData: FormData;
}

const SalaryEvolutionChart: React.FC<SalaryEvolutionChartProps> = ({ providerData }) => {
    const chartData = useMemo(() => {
        if (!providerData) return [];

        const hasHistory = providerData.historicoReajustes && providerData.historicoReajustes.length > 0;

        if (!hasHistory) {
            // If no history, show only the current salary at the start date
            return [{
                date: format(parseISO(providerData.dataInicio), 'MMM/yy'),
                valor: parseFloat(providerData.valorMensal)
            }];
        }

        // Sort history by date to ensure chronological order
        const sortedHistory = [...providerData.historicoReajustes!].sort((a, b) =>
            parseISO(a.data).getTime() - parseISO(b.data).getTime()
        );

        // The first point is the initial salary before any adjustments.
        const initialPoint = {
            date: format(parseISO(providerData.dataInicio), 'MMM/yy'),
            valor: parseFloat(sortedHistory[0].valorAnterior)
        };

        const adjustmentPoints = sortedHistory.map(item => ({
            date: format(parseISO(item.data), 'MMM/yy'),
            valor: parseFloat(item.novoValor)
        }));

        return [initialPoint, ...adjustmentPoints];
    }, [providerData]);
    
    if (chartData.length <= 1 && (!providerData.historicoReajustes || providerData.historicoReajustes.length === 0)) {
        return <p className="text-sm text-gray-500 text-center py-4">Não há dados de evolução salarial para exibir.</p>;
    }


    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(value) => `R$${value / 1000}k`} tick={{ fontSize: 12 }} />
                    <Tooltip
                        formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Salário']}
                        labelFormatter={(label) => `Data: ${label}`}
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="valor" name="Valor Mensal" stroke="#06b6d4" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalaryEvolutionChart;