import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import walletService from '../services/walletService';
import {
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    Search,
    Clock,
    DollarSign
} from 'lucide-react';

const WalletPage = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchWalletData();
        }
    }, [user]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await walletService.getUserWallet(user.id);
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
            case 'USER_REFUND':
                return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
            case 'USER_PAYMENT':
                return <ArrowUpRight className="h-5 w-5 text-red-500" />;
            default:
                return <DollarSign className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTransactionColor = (type) => {
        if (type === 'USER_REFUND') return 'text-green-500';
        if (type === 'USER_PAYMENT') return 'text-red-500';
        return 'text-white';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#060010] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060010] text-white">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            My Wallet
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your payments and refunds</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Wallet Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#1e293b] rounded-2xl p-6 border border-[#312e81] shadow-2xl relative overflow-hidden h-full">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Wallet className="w-48 h-48 text-indigo-400" />
                            </div>

                            <h2 className="text-indigo-200 font-medium text-sm uppercase tracking-wider mb-2">Available Balance</h2>
                            <div className="text-4xl font-bold text-white mb-6">
                                {formatCurrency(wallet?.balance || 0)}
                            </div>

                            <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                <p className="text-xs text-gray-400 mb-1">Last Updated</p>
                                <p className="text-sm font-medium">{formatDate(wallet?.updatedAt || new Date())}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-white/10">
                            <div className="p-3 bg-red-500/10 rounded-xl w-fit mb-4">
                                <ArrowUpRight className="h-6 w-6 text-red-500" />
                            </div>
                            <p className="text-gray-400 text-sm">Total Spent</p>
                            <p className="text-2xl font-bold mt-1">
                                {formatCurrency(transactions
                                    .filter(t => t.transactionType === 'USER_PAYMENT')
                                    .reduce((acc, t) => acc + t.amount, 0))}
                            </p>
                        </div>
                        <div className="bg-[#0f172a]/50 p-6 rounded-2xl border border-white/10">
                            <div className="p-3 bg-green-500/10 rounded-xl w-fit mb-4">
                                <ArrowDownLeft className="h-6 w-6 text-green-500" />
                            </div>
                            <p className="text-gray-400 text-sm">Total Refunded</p>
                            <p className="text-2xl font-bold mt-1 text-green-400">
                                {formatCurrency(transactions
                                    .filter(t => t.transactionType === 'USER_REFUND')
                                    .reduce((acc, t) => acc + t.amount, 0))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="bg-[#0f172a]/50 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-bold">Transaction History</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Booking Ref</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-sm">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                                                    {getTransactionIcon(tx.transactionType)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {tx.transactionType === 'USER_PAYMENT' ? 'Payment Sent' :
                                                            tx.transactionType === 'USER_REFUND' ? 'Refund Received' :
                                                                tx.transactionType.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {tx.description}
                                        </td>
                                        <td className="p-4 text-indigo-400 font-mono">
                                            {tx.bookingId ? `#${tx.bookingId}` : '-'}
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {formatDate(tx.createdAt)}
                                        </td>
                                        <td className={`p-4 text-right font-bold ${getTransactionColor(tx.transactionType)}`}>
                                            {tx.transactionType === 'USER_PAYMENT' ? '-' : '+'}
                                            {formatCurrency(tx.amount)}
                                        </td>
                                    </tr>
                                ))}
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-white/5 rounded-full">
                                                    <Clock className="h-8 w-8 text-gray-600" />
                                                </div>
                                                <p>No transactions yet</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default WalletPage;
