import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Home, Calendar, Users, MapPin } from 'lucide-react';
import hotelService from '../services/hotelService';
import { generateReceipt } from '../utils/receiptGenerator';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const paymentId = location.state?.paymentId;
  const paymentMethod = location.state?.paymentMethod;

  /* PDF Download Handler */
  const handleDownloadReceipt = async () => {
    if (!booking) return;

    try {
      // Fetch hotel details to ensure we have address etc for the receipt
      const hotel = await hotelService.getHotelById(booking.hotelId);
      // We use the booking object from state, assuming it has necessary info. 
      // If it lacks razorpayPaymentId, we might default to the one in state or fetch.
      const bookingForPdf = {
        ...booking,
        razorpayPaymentId: paymentId || booking.razorpayPaymentId, // Ensure payment ID is present
        paymentMethod: paymentMethod || booking.paymentMethod
      };

      generateReceipt(bookingForPdf, hotel);
    } catch (error) {
      console.error('Error generating receipt:', error);
      alert('Could not generate receipt. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Screen Layout */}
      <div className="min-h-screen bg-[#060010] flex items-start justify-center p-4 pt-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl w-full bento-card p-0"
        >
          {/* Success Header */}
          <div className="p-8 text-center border-b border-white/10 bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#8400ff] to-transparent opacity-50"></div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-24 h-24 bg-[#8400ff]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(132,0,255,0.3)] border border-[#8400ff]/20"
            >
              <CheckCircle className="w-12 h-12 text-[#8400ff]" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-3 text-white">
              Booking Confirmed!
            </motion.h1>
            <motion.p variants={itemVariants} className="text-gray-400 text-lg">
              Your payment was successful and your booking is confirmed
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {booking ? (
              <div className="space-y-6">
                {/* Payment Info */}
                <motion.div
                  variants={itemVariants}
                  className="bg-[#0f172a]/40 border border-white/10 rounded-2xl p-6 hover:border-[#8400ff]/30 transition-colors duration-300"
                >
                  <h2 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#8400ff] rounded-full"></span>
                    Payment Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {paymentId && (
                      <div>
                        <span className="text-gray-400 block mb-1">Payment ID</span>
                        <p className="font-mono font-semibold text-white bg-white/5 p-2 rounded border border-white/10">{paymentId}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block mb-1">Booking Reference</span>
                      <p className="font-mono font-semibold text-white bg-white/5 p-2 rounded border border-white/10">{booking.bookingReference || `#${booking.id}`}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Payment Method</span>
                      <p className="font-semibold text-white">{paymentMethod === 'pay_at_hotel' ? 'Pay at Hotel' : 'Online Payment'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Payment Status</span>
                      <p className="font-bold text-[#8400ff] px-3 py-1 bg-[#8400ff]/10 rounded-full inline-block text-xs border border-[#8400ff]/20">
                        {paymentMethod === 'pay_at_hotel' ? 'PAY AT HOTEL' : 'PAID'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Hotel & Booking Details */}
                <motion.div
                  variants={itemVariants}
                  className="bg-[#0f172a]/40 rounded-2xl p-6 border border-white/10 hover:border-[#8400ff]/30 transition-colors duration-300"
                >
                  <h2 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-[#8400ff] rounded-full"></span>
                    Booking Details
                  </h2>

                  {/* Dates & Guests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                      <Calendar className="w-5 h-5 text-[#8400ff] mt-0.5" />
                      <div>
                        <span className="text-gray-400 block mb-1">Check-in</span>
                        <p className="font-bold text-white text-base">
                          {new Date(booking.checkInDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                      <Calendar className="w-5 h-5 text-[#8400ff] mt-0.5" />
                      <div>
                        <span className="text-gray-400 block mb-1">Check-out</span>
                        <p className="font-bold text-white text-base">
                          {new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-[#8400ff] mt-0.5" />
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">Guests</span>
                        <p className="font-semibold text-white mt-1">
                          {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-[#8400ff] mt-0.5" />
                      <div>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">Rooms</span>
                        <p className="font-semibold text-white mt-1">
                          {booking.rooms} {booking.rooms === 1 ? 'Room' : 'Rooms'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-gray-400">Guest Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-gray-400">Name</span>
                        <span className="font-semibold text-white">{booking.guestName}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-gray-400">Contact</span>
                        <span className="font-semibold text-white">{booking.guestPhone}</span>
                      </div>
                      <div className="md:col-span-2 p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between">
                        <span className="text-gray-400">Email</span>
                        <span className="font-semibold text-white">{booking.guestEmail}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Price Summary */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-[#8400ff]/10 to-[#0f172a]/50 rounded-2xl p-6 border border-[#8400ff]/20"
                >
                  <h2 className="font-bold text-lg text-white mb-4">Payment Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-300">
                      <span>Price per night</span>
                      <span className="font-medium text-white">₹{booking.pricePerNight?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>{booking.totalNights} nights × {booking.rooms} room(s)</span>
                      <span className="font-medium text-white">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-[#8400ff]/20 pt-4 mt-4 flex justify-between items-end">
                      <span className="text-base font-bold text-white">Total {paymentMethod === 'pay_at_hotel' ? 'Amount' : 'Paid'}</span>
                      <span className="text-3xl font-bold text-[#8400ff] drop-shadow-[0_0_10px_rgba(132,0,255,0.3)]">
                        ₹{booking.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-3"
                  >
                    <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div></div>
                    <div>
                      <h3 className="font-semibold text-yellow-500 text-sm mb-1">Special Requests</h3>
                      <p className="text-sm text-gray-400">{booking.specialRequests}</p>
                    </div>
                  </motion.div>
                )}

                {/* Important Info */}
                <motion.div variants={itemVariants} className="text-center text-xs text-gray-500 mt-4">
                  <p>A confirmation email has been sent to {booking.guestEmail}</p>
                </motion.div>
              </div>
            ) : (
              <motion.div variants={itemVariants} className="text-center py-12">
                <p className="text-gray-400">No booking details available</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleDownloadReceipt}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 group"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Download Receipt
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn-primary flex-1 flex items-center justify-center gap-2 group"
              >
                <Home className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Back to Home
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PaymentSuccessPage;

