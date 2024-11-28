import React from 'react';
import { ArbitrageOpportunity } from '../utils/arbitrage';

interface ArbitrageTableProps {
  opportunities: ArbitrageOpportunity[];
}

export const ArbitrageTable: React.FC<ArbitrageTableProps> = ({ opportunities }) => {
  if (opportunities.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No arbitrage opportunities found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Buy From
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Sell To
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Price Difference
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              Percentage
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {opportunities.map((opportunity, index) => (
            <tr 
              key={index} 
              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white group-hover:text-gray-900">
                {opportunity.buyExchange.toUpperCase()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white group-hover:text-gray-900">
                {opportunity.sellExchange.toUpperCase()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white group-hover:text-gray-900">
                ${opportunity.priceDifference.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {opportunity.percentageDifference.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};