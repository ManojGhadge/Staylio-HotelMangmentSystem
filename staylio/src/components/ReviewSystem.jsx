import React, { useState } from 'react';

const ReviewSystem = ({
    reviews = [],
    onSubmitReview,
    isAuthenticated = false,
    title = "Reviews",
    canReview = true,
    eligibilityMessage = ""
}) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return;

        setIsSubmitting(true);
        try {
            await onSubmitReview({ rating, reviewText });
            setReviewText('');
            setRating(0);
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">{title} ({reviews.length})</h2>

            {/* Reviews List */}
            <div className="space-y-6 mb-8">
                {reviews.length === 0 ? (
                    <p className="text-gray-400 italic">No reviews yet. Be the first to share your experience!</p>
                ) : (
                    reviews.map((review, index) => (
                        <div key={review.id || index} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-white">{review.username || review.user?.name || 'Anonymous'}</h3>
                                    <p className="text-xs text-gray-400">
                                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-400 text-sm font-bold">
                                    <lord-icon
                                        src="https://cdn.lordicon.com/edplgash.json"
                                        trigger="hover"
                                        colors="primary:#facc15,secondary:#eab308"
                                        style={{ width: '20px', height: '20px' }}
                                    ></lord-icon>
                                    <span>{review.rating}</span>
                                </div>
                            </div>
                            <p className="text-gray-300">{review.reviewText || review.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Review Form */}
            {isAuthenticated ? (
                canReview ? (
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <lord-icon
                                                src="https://cdn.lordicon.com/edplgash.json"
                                                trigger="hover"
                                                colors={`primary:${star <= rating ? '#facc15' : '#4b5563'},secondary:${star <= rating ? '#eab308' : '#374151'}`}
                                                style={{ width: '40px', height: '40px' }}
                                            >
                                            </lord-icon>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Your Review</label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    required
                                    minLength={5}
                                    rows={4}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-500"
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-[#8400ff] text-white rounded-lg hover:bg-[#7000d6] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#8400ff]/25"
                            >
                                {isSubmitting ? 'Submitting...' : 'Post Review'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-gray-400">{eligibilityMessage || "You can review this hotel after completing your stay."}</p>
                    </div>
                )
            ) : (
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-gray-400">Please log in to write a review.</p>
                </div>
            )}
        </div>
    );
};

export default ReviewSystem;
