import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addGolfScoreRequest,
  checkSubscriptionStatusRequest,
  getScoreStatsRequest,
  getUserWinsRequest,
  getUserDrawParticipationRequest
} from "../api/golf";

export const UserDashboardPage = () => {
  const [showScoreForm, setShowScoreForm] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const addScoreMutation = useMutation({
    mutationFn: ({ score, date, courseInfo }) => addGolfScoreRequest(score, date, courseInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoreStats"] });
      queryClient.invalidateQueries({ queryKey: ["drawParticipation"] });
      setShowScoreForm(false);
    }
  });


  const { data: subscription } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: checkSubscriptionStatusRequest
  });

  const { data: scoreStats } = useQuery({
    queryKey: ["scoreStats"],
    queryFn: getScoreStatsRequest
  });

  const { data: wins } = useQuery({
    queryKey: ["userWins"],
    queryFn: getUserWinsRequest
  });

  const { data: drawParticipation } = useQuery({
    queryKey: ["drawParticipation"],
    queryFn: getUserDrawParticipationRequest
  });

  const isActiveSubscriber = subscription?.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Your Dashboard</h1>

      {/* Subscription Status */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-8 rounded-xl border-2 border-green-200">
        <h2 className="text-2xl font-bold mb-4">Subscription Status</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <p className="text-2xl font-bold text-green-600">
              {subscription?.status || "INACTIVE"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Plan</p>
            <p className="text-2xl font-bold">
              {subscription?.subscription?.planType || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Renewal Date</p>
            <p className="text-lg font-semibold">
              {subscription?.subscription?.renewalDate
                ? new Date(subscription.subscription.renewalDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Days Remaining</p>
            <p className="text-lg font-semibold">{subscription?.daysRemaining || 0} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Selected Charity</p>
            <p className="text-lg font-semibold">
              {subscription?.subscription?.charityName || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Charity Contribution</p>
            <p className="text-lg font-semibold">
              {subscription?.subscription?.charityPercentage
                ? `${subscription.subscription.charityPercentage}%`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Golf Scores */}
      <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Latest Scores</h2>
          <button
            onClick={() => {
              if (!isActiveSubscriber) {
                navigate("/subscription");
                return;
              }
              setShowScoreForm(!showScoreForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showScoreForm ? "Cancel" : "Add Score"}
          </button>
        </div>

        {!isActiveSubscriber && (
          <p className="text-sm text-amber-700">
            Score entry is available for active subscribers only. Subscribe to unlock this feature.
          </p>
        )}

        {showScoreForm && (
          <ScoreEntryForm
            onClose={() => setShowScoreForm(false)}
            onSubmit={(payload) => addScoreMutation.mutateAsync(payload)}
            isSubmitting={addScoreMutation.isPending}
            submitError={addScoreMutation.error?.response?.data?.message || addScoreMutation.error?.message}
          />
        )}

        {scoreStats && scoreStats.count > 0 ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Scores</p>
                <p className="text-2xl font-bold">{scoreStats.count}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-2xl font-bold">{scoreStats.average}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Best</p>
                <p className="text-2xl font-bold">{scoreStats.best}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Worst</p>
                <p className="text-2xl font-bold">{scoreStats.worst}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold mb-3">Score History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {scoreStats.scores.map((score) => (
                  <div key={score._id ?? score.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{score.score} points</p>
                      <p className="text-sm text-gray-600">
                        {new Date(score.date).toLocaleDateString()}
                      </p>
                    </div>
                    {score.courseInfo && (
                      <p className="text-sm text-gray-600">{score.courseInfo}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-600 py-8">No scores yet. Add your first golf score!</p>
        )}
      </div>

      {/* Draw Participation */}
      <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold">Draw Participation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Draws Entered</p>
            <p className="text-3xl font-bold text-indigo-600">{drawParticipation?.participationCount || 0}</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Winnings</p>
            <p className="text-3xl font-bold text-pink-600">
              ${((wins?.reduce((sum, w) => sum + w.winAmount, 0) || 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Wins */}
      {wins && wins.length > 0 && (
        <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
          <h2 className="text-2xl font-bold">Your Wins</h2>
          <div className="space-y-4">
            {wins.map((win) => (
              <div key={win._id ?? win.id} className="border-l-4 border-yellow-400 p-4 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{win.matchType} Match</p>
                    <p className="text-sm text-gray-600">
                      {new Date(win.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${(win.winAmount / 100).toFixed(2)}
                    </p>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      win.paymentStatus === "PAID"
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}>
                      {win.paymentStatus}
                    </span>
                  </div>
                </div>
                {win.verificationStatus === "PENDING" && (
                  <p className="text-sm text-orange-600 mt-2">
                    Pending verification - upload proof to speed up the process
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Score Entry Form Component
const ScoreEntryForm = ({ onClose, onSubmit, isSubmitting, submitError }) => {
  const [formData, setFormData] = useState({
    score: "",
    date: new Date().toISOString().split("T")[0],
    courseInfo: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      score: Number(formData.score),
      date: formData.date,
      courseInfo: formData.courseInfo?.trim() || undefined
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Score (1-45 Stableford)</label>
        <input
          type="number"
          name="score"
          value={formData.score}
          onChange={handleChange}
          min="1"
          max="45"
          required
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Enter your score"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Course (Optional)</label>
        <input
          type="text"
          name="courseInfo"
          value={formData.courseInfo}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Course name or location"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : "Save Score"}
      </button>
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
    </form>
  );
};

export default UserDashboardPage;
