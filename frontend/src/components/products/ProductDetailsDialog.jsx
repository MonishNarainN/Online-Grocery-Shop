import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, StarHalf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { API_URL } from '@/config';

function StarRating({ rating, setRating, readOnly = false }) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && setRating(star)}
                    className={`focus:outline-none ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'}`}
                >
                    <Star
                        className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

export function ProductDetailsDialog({ product, children }) {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchReviews();
        }
    }, [isOpen, product.id]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/products/${product.id}/reviews`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error("Failed to fetch reviews:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const url = editingReviewId
                ? `${API_URL}/products/${product.id}/reviews/${editingReviewId}`
                : `${API_URL}/products/${product.id}/reviews`;
            const method = editingReviewId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: newReview.rating,
                    comment: newReview.comment,
                    user_name: user?.name || user?.email?.split('@')[0] || 'Customer'
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || `Failed to ${editingReviewId ? 'update' : 'add'} review`);

            toast({ title: 'Success', description: `Review ${editingReviewId ? 'updated' : 'added'} successfully!` });
            setNewReview({ rating: 5, comment: '' });
            setEditingReviewId(null);
            fetchReviews();
        } catch (err) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/products/${product.id}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to delete review');

            toast({ title: 'Success', description: 'Review deleted successfully!' });

            if (editingReviewId === reviewId) {
                setEditingReviewId(null);
                setNewReview({ rating: 5, comment: '' });
            }

            fetchReviews();
        } catch (err) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    };

    const userHasReviewed = user && reviews.some(r => r.user_id === user.id);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-display">{product.name}</DialogTitle>
                    <DialogDescription>
                        {product.category}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {/* Product Info */}
                    <div>
                        <div className="aspect-square bg-secondary rounded-xl overflow-hidden mb-4">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">🛒</div>
                            )}
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed">{product.description}</p>

                        <div className="flex items-center gap-2 mb-4">
                            <StarRating rating={product.averageRating || 0} readOnly />
                            <span className="text-sm text-muted-foreground font-medium">({product.numReviews || 0} Reviews)</span>
                        </div>

                        <div className="mb-6">
                            {product.discountedPrice ? (
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-primary">₹{product.discountedPrice.toFixed(2)}</span>
                                    <span className="text-lg text-muted-foreground line-through mb-1">₹{product.price.toFixed(2)}</span>
                                </div>
                            ) : (
                                <div className="text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</div>
                            )}
                            <div className="text-sm text-muted-foreground mt-1">per {product.unit}</div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="flex flex-col gap-6">
                        <h3 className="text-xl font-bold font-display border-b pb-2">Customer Reviews</h3>

                        {/* Review List */}
                        <div className="flex-1 overflow-y-auto pr-2 max-h-[300px] flex flex-col gap-4">
                            {isLoading ? (
                                <div className="text-muted-foreground text-center py-4">Loading reviews...</div>
                            ) : reviews.length === 0 ? (
                                <div className="text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">No reviews yet. Be the first to review!</div>
                            ) : (
                                reviews.map(review => (
                                    <div key={review._id} className="bg-card p-4 rounded-xl border border-border shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary uppercase">
                                                    {review.user_name?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{review.user_name}</p>
                                                    <p className="text-[10px] text-muted-foreground">{format(new Date(review.created_at), 'PPP')}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <StarRating rating={review.rating} readOnly />
                                                {user && review.user_id === user.id && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingReviewId(review._id);
                                                                setNewReview({ rating: review.rating, comment: review.comment });
                                                            }}
                                                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteReview(review._id)}
                                                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Write a Review */}
                        {user ? (
                            userHasReviewed && !editingReviewId ? (
                                <div className="bg-primary/10 text-primary p-3 rounded-lg text-sm font-medium text-center border border-primary/20">
                                    You have already reviewed this product.
                                </div>
                            ) : (
                                <form onSubmit={submitReview} className="bg-muted/30 p-4 rounded-xl border flex flex-col gap-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-semibold">{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h4>
                                        {editingReviewId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingReviewId(null);
                                                    setNewReview({ rating: 5, comment: '' });
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Rating:</span>
                                        <StarRating
                                            rating={newReview.rating}
                                            setRating={(r) => setNewReview({ ...newReview, rating: r })}
                                        />
                                    </div>
                                    <Textarea
                                        placeholder="Share your thoughts about this product..."
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        required
                                        className="resize-none h-24 bg-background"
                                    />
                                    <Button type="submit" className="w-full">Submit Review</Button>
                                </form>
                            )
                        ) : (
                            <div className="bg-muted p-4 rounded-xl text-center border">
                                <p className="text-sm text-muted-foreground mb-3">Sign in to leave a review</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
