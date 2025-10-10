import React from 'react';

interface KPICardProps {
    title: string;
    value: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value }) => {
    return (
        <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
    );
};

export default KPICard;
