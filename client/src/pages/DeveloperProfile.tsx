import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { LoadingPage } from '../components/ui/LottieLoader';
import SendRequestModal from '../components/forms/SendRequestModal';
import { getAvailabilityColor, formatRelativeTime } from '../utils/helpers';
import type { User, ReviewResponse } from '../types';

export default function DeveloperProfile() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewCat, setReviewCat] = useState({ communication: 5, technicalSkill: 5, reliability: 5, teamwork: 5 });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [devRes, revRes, followingRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`).catch(() => ({ data: null })),
          api.get('/follow/following').catch(() => ({ data: [] })),
        ]);
        setDeveloper(devRes.data);
        setReviewData(revRes.data);
        setFollowing(followingRes.data?.some((f: any) => f.followed.id === id) ?? false);
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [id]);

  const toggleFollow = async () => {
    const { data } = await api.post(`/follow/${id}`);
    setFollowing(data.following);
  };

  const startConversation = async () => {
    try {
      const { data } = await api.post('/conversations', { userId: id });
      navigate(`/chat/${data.id}`);
    } catch {}
  };

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        reviewedId: id, rating: reviewRating, comment: reviewComment || undefined,
        ...reviewCat,
      });
      const { data } = await api.get(`/reviews/user/${id}`);
      setReviewData(data);
      setShowReviewForm(false);
      setReviewComment('');
      setReviewRating(5);
      setReviewCat({ communication: 5, technicalSkill: 5, reliability: 5, teamwork: 5 });
    } catch {}
    setSubmittingReview(false);
  };

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: string }) => (
    <div className={`flex gap-0.5 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </div>
  );

  if (loading) return <LoadingPage />;
    if (!developer) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">We couldn't find this developer.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/discover" className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-[#6C4CF1] transition-colors">&larr; Back to Discover</Link>
      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{developer.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{developer.country || 'Location not set'} {developer.timezone ? `(${developer.timezone})` : ''}</p>
            <p className="mt-1">
              Status: <span className={getAvailabilityColor(developer.availability)}>{developer.availability}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {currentUser && currentUser.id !== developer.id && (
              <>
                <button onClick={toggleFollow} className={`px-4 py-2 rounded-[12px] text-sm font-semibold transition ${following ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white shadow-lg shadow-[#6C4CF1]/20'}`}>
                  {following ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={startConversation}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-[12px] font-semibold text-sm transition hover:border-[#6C4CF1]/30"
                >
                  Message
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm transition"
                >
                  Send Request
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {developer.profile && (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6 space-y-4" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">About</h2>
          {developer.profile.bio && <p className="text-gray-600 dark:text-gray-300">{developer.profile.bio}</p>}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 dark:text-gray-500">Experience:</span>{' '}
              <span className="text-gray-700 dark:text-gray-200">{developer.profile.experience ? `${developer.profile.experience} years` : 'Not specified'}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">Remote Only:</span>{' '}
              <span className="text-gray-700 dark:text-gray-200">{developer.profile.remoteOnly ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-400 dark:text-gray-500">Open to Collab:</span>{' '}
              <span className="text-gray-700 dark:text-gray-200">{developer.profile.openToCollab ? 'Yes' : 'No'}</span>
            </div>
            {developer.profile.githubUrl && (
              <div>
                <span className="text-gray-400 dark:text-gray-500">GitHub:</span>{' '}
                <a href={developer.profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#6C4CF1] hover:text-[#5538D6]">{developer.profile.githubUrl}</a>
              </div>
            )}
            {developer.profile.portfolio && (
              <div>
                <span className="text-gray-400 dark:text-gray-500">Portfolio:</span>{' '}
                <a href={developer.profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-[#6C4CF1] hover:text-[#5538D6]">{developer.profile.portfolio}</a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Skills</h2>
        {developer.skills.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No skills have been added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {developer.skills.map((s) => (
              <span key={s.skill.id} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-[8px] text-sm">{s.skill.name}</span>
            ))}
          </div>
        )}
      </div>

      {developer.ownedProjects && developer.ownedProjects.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Projects</h2>
          <div className="space-y-2">
            {developer.ownedProjects.map((p) => (
              <div key={p.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700 dark:text-gray-200">{p.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
          <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400 dark:text-gray-500">Response Rate:</span>{' '}
            <span className="text-gray-700 dark:text-gray-200">{Math.round(developer.responseRate * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Collaboration Score:</span>{' '}
            <span className="text-gray-700 dark:text-gray-200">{Math.round((developer as any).collaborationScore * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Projects Completed:</span>{' '}
            <span className="text-gray-700 dark:text-gray-200">{(developer as any).projectSuccessCount || 0}</span>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500">Last Active:</span>{' '}
            <span className="text-gray-700 dark:text-gray-200">{formatRelativeTime(developer.lastActive)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100/80 dark:border-gray-800/80 p-6" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reviews</h2>
          {reviewData && (
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(reviewData.averageRating)} />
              <span className="text-sm text-gray-500 dark:text-gray-400">({reviewData.totalReviews})</span>
            </div>
          )}
        </div>
        {reviewData?.categoryAverages && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {([
              { key: 'communication', label: 'Communication' },
              { key: 'technicalSkill', label: 'Technical' },
              { key: 'reliability', label: 'Reliability' },
              { key: 'teamwork', label: 'Teamwork' },
            ] as const).map((c) => {
              const cat = reviewData.categoryAverages!;
              const val = cat[c.key];
              return (
                <div key={c.key} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-400 dark:text-gray-500">{c.label}</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{val != null ? `${Math.round(val * 10) / 10}/5` : 'N/A'}</div>
                </div>
              );
            })}
          </div>
        )}
        {!reviewData || reviewData.reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet — be the first to leave one!</p>
        ) : (
          <div className="space-y-3">
            {reviewData.reviews.map((r) => (
              <div key={r.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-200">{r.reviewer.name}</span>
                    <StarRating rating={r.rating} />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.comment}</p>}
                {r.project && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Project: {r.project.name}</p>}
              </div>
            ))}
          </div>
        )}
        {currentUser && currentUser.id !== id && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="mt-4 text-[#6C4CF1] hover:text-[#5538D6] text-sm"
          >
            {showReviewForm ? 'Cancel' : 'Leave a Review'}
          </button>
        )}
        {showReviewForm && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Overall Rating</label>
              <div className="flex gap-1 text-2xl">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)} className={s <= reviewRating ? 'text-yellow-400' : 'text-gray-200'} aria-label={s + " stars"}>{s <= reviewRating ? '★' : '☆'}</button>
                ))}
              </div>
            </div>
            {[
              { key: 'communication', label: 'Communication' },
              { key: 'technicalSkill', label: 'Technical Skill' },
              { key: 'reliability', label: 'Reliability' },
              { key: 'teamwork', label: 'Teamwork' },
            ].map((c) => (
              <div key={c.key}>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{c.label}</label>
                <div className="flex gap-1 text-lg">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewCat({ ...reviewCat, [c.key]: s })}
                      className={s <= (reviewCat as any)[c.key] ? 'text-yellow-400' : 'text-gray-200'} aria-label={s + " stars"}>
                      {s <= (reviewCat as any)[c.key] ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-[14px] px-3 py-2 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-[#6C4CF1] resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="bg-gradient-to-r from-[#6C4CF1] to-[#5538D6] text-white px-5 py-2.5 rounded-[12px] font-semibold shadow-lg shadow-[#6C4CF1]/20 text-sm transition disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}
      </div>

      {showRequestModal && (
        <SendRequestModal
          receiverId={developer.id}
          receiverName={developer.name}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  );
}
