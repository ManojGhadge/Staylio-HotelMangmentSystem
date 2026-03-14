import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    IndianRupee,
    Clock,
    Search,
    Download,
    TrendingUp
} from 'lucide-react';
import walletService from '../services/walletService';

const WalletPage = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await walletService.getAdminWallet();
            setWallet(response.data.wallet);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Error fetching wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'USER_PAYMENT':
                return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
            case 'ADMIN_CREDIT':
                return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
            case 'USER_REFUND':
                return <ArrowUpRight className="h-5 w-5 text-red-500" />;
            case 'HOST_SETTLEMENT':
                return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
            case 'ADMIN_DEBIT':
                return <ArrowUpRight className="h-5 w-5 text-red-500" />;
            default:
                return <IndianRupee className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTransactionColor = (type) => {
        if (['USER_PAYMENT', 'ADMIN_CREDIT'].includes(type)) return 'text-green-500';
        if (['USER_REFUND', 'ADMIN_DEBIT'].includes(type)) return 'text-red-500';
        if (['HOST_SETTLEMENT'].includes(type)) return 'text-blue-500';
        return 'text-gray-500';
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'ALL') return true;
        return t.transactionType === filter;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0f172a]">
                <div className="text-white text-xl">Loading Wallet...</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-[#0f172a] min-h-screen text-white">
            <h1 className="text-3xl font-bold">Admin Wallet & Escrow</h1>

            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <IndianRupee className="w-32 h-32 text-indigo-500" />
                    </div>
                    <h2 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Current Escrow Balance</h2>
                    <div className="text-4xl font-bold mt-2 text-indigo-400">
                        {formatCurrency(wallet?.balance || 0)}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Funds held in escrow pending completion or refund.
                    </p>
                </div>

                <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/10 shadow-xl">
                    <h2 className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-4">Quick Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total Transactions</span>
                            <span className="font-bold">{transactions.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Pending Settlements</span>
                            <span className="font-bold text-yellow-500">
                                {transactions.filter(t => t.transactionType === 'USER_PAYMENT').length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Transaction History</h2>

                    <div className="flex gap-2 text-sm overflow-x-auto pb-2 md:pb-0">
                        {['ALL', 'USER_PAYMENT', 'USER_REFUND', 'HOST_SETTLEMENT'].map((tType) => (
                            <button
                                key={tType}
                                onClick={() => setFilter(tType)}
                                className={`px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${filter === tType
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-white/10 text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                {tType.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-gray-400 text-sm uppercase">
                                <th className="p-4">Type</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Booking ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-black/20 ${getTransactionColor(tx.transactionType)}`}>
                                                {getTransactionIcon(tx.transactionType)}
                                            </div>
                                            <span className="font-medium text-sm">
                                                {tx.transactionType.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300 text-sm">
                                        {tx.description}
                                        <div className="text-xs text-gray-500 mt-1">
                                            {tx.fromWalletId ? `From: Wallet #${tx.fromWalletId}` : ''}
                                            {tx.toWalletId ? ` → To: Wallet #${tx.toWalletId}` : ''}
                                        </div>
                                    </td>
                                    <td className="p-4 text-indigo-400 text-sm font-mono">
                                        #{tx.bookingId}
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {formatDate(tx.createdAt)}
                                    </td>
                                    <td className={`p-4 text-right font-bold ${getTransactionColor(tx.transactionType)}`}>
                                        {['USER_PAYMENT'].includes(tx.transactionType) ? '+' : '-'}
                                        {formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
