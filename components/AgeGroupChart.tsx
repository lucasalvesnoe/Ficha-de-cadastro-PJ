import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { differenceInYears, parseISO } from 'date-fns';
import { FormData } from '../types';

interface AgeGroupChartProps {
    data: FormData[];
}

const COLORS = ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

const AgeGroupChart: React.FC<AgeGroupChartProps> = ({ data }) => {
    const chartData = useMemo(() => {
        const ageGroups = {
            '< 25': 0,
            '25-34': 0,
            '35-44': 0,
            '45+': 0,
        };

        const today = new Date();
        data.forEach(pj => {
            if (!pj.dataNascimento) return;
            try {
                const age = differenceInYears(today, parseISO(pj.dataNascimento));
                if (age < 25) ageGroups['< 25']++;
                else if (age <= 34) ageGroups['25-34']++;
                else if (age <= 44) ageGroups['35-44']++;
                else ageGroups['45+']++;
            } catch(e) {
                console.error("Invalid date for age calculation", pj.dataNascimento);
            }
        });

        return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
    }, [data]);

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <Legend iconType="circle" iconSize={10} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AgeGroupChart;