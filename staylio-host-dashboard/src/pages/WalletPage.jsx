import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import walletService from '../services/walletService';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    DollarSign,
    TrendingUp,
    Calendar,
    Download
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
    }, [user?.id]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const response = await walletService.getHostWallet(user.id);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8400ff]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Earnings & Wallet</h1>
                    <p className="text-gray-400 mt-1">Manage your payouts and view transaction history</p>
                </div>
                {/* <button className="px-4 py-2 bg-[#1e293b] text-white rounded-lg border border-white/10 hover:bg-white/5 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                </button> */}
            </div>

            {/* Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[#8400ff] to-[#6366f1] rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Wallet className="w-32 h-32" />
                    </div>
                    <p className="font-medium text-white/80 uppercase tracking-wider text-xs">Total Balance</p>
                    <div className="text-4xl font-bold mt-2">
                        {formatCurrency(wallet?.balance || 0)}
                    </div>
                    <p className="text-xs text-white/60 mt-4 bg-white/10 inline-block px-2 py-1 rounded">
                        Available for Payout
                    </p>
                </div>

                <div className="bg-[#1e293b] rounded-2xl p-6 border border-white/10 shadow-xl">
                    <h2 className="text-gray-400 font-medium text-xs uppercase tracking-wider mb-4">Total Earnings (This Month)</h2>
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-green-400">
                            {/* Placeholder: Real calculation would filter by date */}
                            {formatCurrency(transactions
                                .filter(t => t.transactionType === 'HOST_SETTLEMENT')
                                .reduce((acc, t) => acc + t.amount, 0)
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Gross earnings from completed bookings.
                    </p>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">Transaction History</h2>
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
                                        <div className="flex items-center gap-2">
                                            {tx.transactionType === 'HOST_SETTLEMENT' ? (
                                                <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                                    <ArrowDownLeft className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-lg bg-gray-500/20 text-gray-400">
                                                    <DollarSign className="h-4 w-4" />
                                                </div>
                                            )}
                                            <span className="font-medium text-white">
                                                {tx.transactionType.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        {tx.description}
                                    </td>
                                    <td className="p-4 text-[#8400ff] font-mono">
                                        #{tx.bookingId}
                                    </td>
                                    <td className="p-4 text-gray-400">
                                        {formatDate(tx.createdAt)}
                                    </td>
                                    <td className="p-4 text-right font-bold text-green-400">
                                        + {formatCurrency(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
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
