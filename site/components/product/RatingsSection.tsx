'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { RatingStars } from './RatingStars';
import { formatDateTime } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';

interface RatingsSectionProps {
  productId: string;
}

export function RatingsSection({ productId }: RatingsSectionProps) {
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
  const { localePath } = useLocale();

  const [reviews, setReviews] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ averageRating: number; totalReviews: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'highest' | 'lowest'>('latest');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [newRating, setNewRating] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = (s = sort) => {
    setLoading(true);
    fetch(`/api/ratings/${productId}?sort=${s}&limit=10`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.results ?? []);
        setSummary(data.summary ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const handleSortChange = (s: typeof sort) => {
    setSort(s);
    fetchReviews(s);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newRating === 0) { addToast('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/ratings/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating, comment: newComment, title: newTitle || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addToast('Review submitted!');
      setShowForm(false);
      setNewRating(0);
      setNewTitle('');
      setNewComment('');
      fetchReviews();
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-8 mt-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-1">Customer Reviews</h2>
          {summary && summary.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars rating={summary.averageRating} size="sm" />
              <span className="text-sm text-gray-600">
                {summary.averageRating.toFixed(1)} · {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        {isLoggedIn && !showForm && (
          <Button variant="secondary" size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold mb-3">Your Review</h3>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Rating</label>
            <RatingStars rating={newRating} interactive onRate={setNewRating} size="lg" />
          </div>
          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Title (optional)</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Summary of your experience"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Review</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Tell others about your experience..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" loading={submitting}>Submit Review</Button>
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {!isLoggedIn && (
        <p className="text-sm text-gray-500 mb-4">
          <Link href={localePath('/login')} className="text-primary hover:underline">Sign in</Link> to write a review.
        </p>
      )}

      {/* Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">Sort:</span>
          {(['latest', 'highest', 'lowest'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`text-xs px-2 py-1 rounded ${sort === s ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-200 rounded" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <RatingStars rating={review.rating} size="sm" />
                  {review.title && <p className="text-sm font-medium text-gray-900 mt-1">{review.title}</p>}
                </div>
                <span className="text-xs text-gray-400">{formatDateTime(review.createdAt)}</span>
              </div>
              {review.text && <p className="text-sm text-gray-700 mt-1">{review.text}</p>}
              {review.authorName && <p className="text-xs text-gray-400 mt-1">— {review.authorName}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
