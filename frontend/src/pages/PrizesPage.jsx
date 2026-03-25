import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import {
  checkSubscriptionStatusRequest,
  getScoreStatsRequest,
  getUserDrawParticipationRequest,
  getUserWinsRequest,
  listDrawsRequest
} from "../api/golf";

export const PrizesPage = () => {
  const { isAuthenticated } = useAuth();

  const { data: publishedDraws } = useQuery({
    queryKey: ["publishedDraws"],
    queryFn: () => listDrawsRequest("PUBLISHED")
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: checkSubscriptionStatusRequest,
    enabled: isAuthenticated,
    retry: false
  });

  const { data: scoreStats } = useQuery({
    queryKey: ["scoreStats"],
    queryFn: getScoreStatsRequest,
    enabled: isAuthenticated,
    retry: false
  });

  const { data: userWins } = useQuery({
    queryKey: ["userWins"],
    queryFn: getUserWinsRequest,
    enabled: isAuthenticated,
    retry: false
  });

  const { data: drawParticipation } = useQuery({
    queryKey: ["drawParticipation"],
    queryFn: getUserDrawParticipationRequest,
    enabled: isAuthenticated,
    retry: false
  });

  const hasActiveSubscription = subscriptionStatus?.status === "ACTIVE";
  const hasEnoughScores = (scoreStats?.count || 0) >= 5;
  const isEligibleForNextDraw = hasActiveSubscription && hasEnoughScores;

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 px-8 py-10 text-white">
        <h1 className="text-4xl font-bold">Prize Center</h1>
        <p className="mt-3 max-w-3xl text-emerald-100">
          Track draw eligibility, review recent published draws, and monitor winnings in one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <EligibilityCard
          title="Active Subscription"
          ok={hasActiveSubscription}
          helpText={hasActiveSubscription ? "Active" : "Required to enter draws"}
        />
        <EligibilityCard
          title="5 Latest Scores"
          ok={hasEnoughScores}
          helpText={`${scoreStats?.count || 0}/5 scores available`}
        />
        <EligibilityCard
          title="Next Draw Eligibility"
          ok={isEligibleForNextDraw}
          helpText={isEligibleForNextDraw ? "Eligible" : "Complete requirements"}
        />
      </section>

      {!isAuthenticated && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          Sign in to view your personal eligibility and win history.
        </section>
      )}

      {isAuthenticated && (
        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Your Win Summary</h2>
            <p className="mt-2 text-slate-600">
              Wins: {userWins?.length || 0}
            </p>
            <p className="text-slate-600">
              Total: ${((userWins?.reduce((sum, item) => sum + (item.winAmount || 0), 0) || 0) / 100).toFixed(2)}
            </p>
            <div className="mt-4">
              <Link
                to="/dashboard"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">How To Win</h2>
            <ul className="mt-3 space-y-2 text-slate-700">
              <li>1. Keep subscription ACTIVE.</li>
              <li>2. Maintain your latest 5 Stableford scores.</li>
              <li>3. Admin publishes monthly draw results.</li>
              <li>4. Matching numbers win prize tiers.</li>
            </ul>
          </div>
        </section>
      )}

      {isAuthenticated && (
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">My Draw Entries</h2>
          <p className="mt-2 text-slate-600">
            Total entries: {drawParticipation?.participationCount || 0}
          </p>

          {drawParticipation?.draws && drawParticipation.draws.length > 0 ? (
            <div className="mt-4 space-y-3">
              {drawParticipation.draws.slice(0, 8).map((draw) => (
                <div
                  key={draw._id ?? draw.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {new Date(draw.drawMonth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long"
                      })}
                    </p>
                    <p className="text-sm text-slate-600">{draw.drawType || "RANDOM"} draw</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      draw.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : draw.status === "SIMULATED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {draw.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-slate-600">No draw entries yet. Add scores to enter upcoming draws.</p>
          )}
        </section>
      )}

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Recent Published Draws</h2>
        {publishedDraws && publishedDraws.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Participants</th>
                  <th className="px-4 py-2">Prize Pool</th>
                  <th className="px-4 py-2">Winning Numbers</th>
                </tr>
              </thead>
              <tbody>
                {publishedDraws.slice(0, 6).map((draw) => (
                  <tr key={draw._id ?? draw.id} className="border-b">
                    <td className="px-4 py-2">
                      {new Date(draw.drawMonth).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long"
                      })}
                    </td>
                    <td className="px-4 py-2">{draw.participantCount || 0}</td>
                    <td className="px-4 py-2">${((draw.totalPrizePool || 0) / 100).toFixed(2)}</td>
                    <td className="px-4 py-2">{draw.winningNumbers?.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-slate-600">No published draws yet. Admin needs to publish draw results.</p>
        )}
      </section>
    </div>
  );
};

const EligibilityCard = ({ title, ok, helpText }) => (
  <div className={`rounded-xl border p-5 ${ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
    <p className="text-sm font-semibold text-slate-600">{title}</p>
    <p className={`mt-1 text-2xl font-bold ${ok ? "text-emerald-700" : "text-rose-700"}`}>
      {ok ? "Yes" : "No"}
    </p>
    <p className="mt-1 text-sm text-slate-600">{helpText}</p>
  </div>
);
