import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  approveWinnerRequest,
  createCharityRequest,
  createDrawRequest,
  deleteCharityRequest,
  getDrawsRequest,
  getPendingWinnersRequest,
  getWinnerStatsRequest,
  listCharitiesRequest,
  listUsersRequest,
  publishDrawResultsRequest,
  rejectWinnerRequest,
  simulateDrawRequest
} from "../api/golf";

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: draws } = useQuery({
    queryKey: ["draws"],
    queryFn: () => getDrawsRequest()
  });

  const { data: pendingWinners } = useQuery({
    queryKey: ["pendingWinners"],
    queryFn: getPendingWinnersRequest
  });

  const { data: winnerStats } = useQuery({
    queryKey: ["winnerStats"],
    queryFn: getWinnerStatsRequest
  });

  const { data: users } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: listUsersRequest
  });

  const { data: charities } = useQuery({
    queryKey: ["adminCharities"],
    queryFn: () => listCharitiesRequest()
  });

  const refreshAdminData = () => {
    queryClient.invalidateQueries({ queryKey: ["draws"] });
    queryClient.invalidateQueries({ queryKey: ["pendingWinners"] });
    queryClient.invalidateQueries({ queryKey: ["winnerStats"] });
    queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    queryClient.invalidateQueries({ queryKey: ["adminCharities"] });
  };

  const createDrawMutation = useMutation({
    mutationFn: ({ drawMonth, drawType }) => createDrawRequest(drawMonth, drawType),
    onSuccess: refreshAdminData
  });

  const simulateDrawMutation = useMutation({
    mutationFn: (drawId) => simulateDrawRequest(drawId),
    onSuccess: refreshAdminData
  });

  const publishDrawMutation = useMutation({
    mutationFn: (drawId) => publishDrawResultsRequest(drawId),
    onSuccess: refreshAdminData
  });

  const approveWinnerMutation = useMutation({
    mutationFn: (winnerId) => approveWinnerRequest(winnerId),
    onSuccess: refreshAdminData
  });

  const rejectWinnerMutation = useMutation({
    mutationFn: ({ winnerId, rejectionReason }) => rejectWinnerRequest(winnerId, rejectionReason),
    onSuccess: refreshAdminData
  });

  const createCharityMutation = useMutation({
    mutationFn: ({ name, description, imageUrl, website, email }) =>
      createCharityRequest(name, description, imageUrl, website, email),
    onSuccess: refreshAdminData
  });

  const deleteCharityMutation = useMutation({
    mutationFn: (charityId) => deleteCharityRequest(charityId),
    onSuccess: refreshAdminData
  });

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "draws", label: "Draws" },
          { id: "winners", label: "Winners" },
          { id: "users", label: "User Management" },
          { id: "charities", label: "Charities" },
          { id: "analytics", label: "Analytics" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-semibold transition border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Pending Verifications"
              value={winnerStats?.pendingVerification || 0}
              bgColor="bg-yellow-50"
              textColor="text-yellow-600"
            />
            <MetricCard
              title="Approved Winners"
              value={winnerStats?.approvedWinners || 0}
              bgColor="bg-green-50"
              textColor="text-green-600"
            />
            <MetricCard
              title="Paid Out"
              value={`$${((winnerStats?.totalPaidOut || 0) / 100).toFixed(0)}`}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
            />
            <MetricCard
              title="Pending Payment"
              value={`$${((winnerStats?.pendingPaymentAmount || 0) / 100).toFixed(0)}`}
              bgColor="bg-purple-50"
              textColor="text-purple-600"
            />
          </div>

          {/* Upcoming Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Pending Winner Verifications</h3>
              <p className="text-3xl font-bold text-orange-600 mb-4">
                {pendingWinners?.length || 0}
              </p>
              <button
                onClick={() => setActiveTab("winners")}
                className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
              >
                Review Submissions
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Recent Draws</h3>
              <p className="text-3xl font-bold text-blue-600 mb-4">{draws?.length || 0}</p>
              <button
                onClick={() => setActiveTab("draws")}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Manage Draws
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draws Tab */}
      {activeTab === "draws" && (
        <DrawsManagement
          draws={draws}
          onCreateDraw={(payload) => createDrawMutation.mutate(payload)}
          onSimulateDraw={(drawId) => simulateDrawMutation.mutate(drawId)}
          onPublishDraw={(drawId) => publishDrawMutation.mutate(drawId)}
          loading={
            createDrawMutation.isPending ||
            simulateDrawMutation.isPending ||
            publishDrawMutation.isPending
          }
          error={
            createDrawMutation.error?.response?.data?.message ||
            simulateDrawMutation.error?.response?.data?.message ||
            publishDrawMutation.error?.response?.data?.message ||
            null
          }
        />
      )}

      {/* Winners Tab */}
      {activeTab === "winners" && (
        <WinnersManagement
          pendingWinners={pendingWinners}
          onApprove={(winnerId) => approveWinnerMutation.mutate(winnerId)}
          onReject={(winnerId, rejectionReason) =>
            rejectWinnerMutation.mutate({ winnerId, rejectionReason })
          }
          loading={approveWinnerMutation.isPending || rejectWinnerMutation.isPending}
          error={
            approveWinnerMutation.error?.response?.data?.message ||
            rejectWinnerMutation.error?.response?.data?.message ||
            null
          }
        />
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <UsersManagement users={users} />
      )}

      {/* Charities Tab */}
      {activeTab === "charities" && (
        <CharitiesManagement
          charities={charities}
          onCreateCharity={(payload) => createCharityMutation.mutate(payload)}
          onDeleteCharity={(charityId) => deleteCharityMutation.mutate(charityId)}
          loading={createCharityMutation.isPending || deleteCharityMutation.isPending}
          error={
            createCharityMutation.error?.response?.data?.message ||
            deleteCharityMutation.error?.response?.data?.message ||
            null
          }
        />
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <AnalyticsView
          winnerStats={winnerStats}
          drawsCount={draws?.length || 0}
          usersCount={users?.length || 0}
          charitiesCount={charities?.length || 0}
        />
      )}
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, bgColor, textColor }) => (
  <div className={`${bgColor} p-6 rounded-lg`}>
    <p className="text-sm text-gray-600 mb-2">{title}</p>
    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
  </div>
);

// Draws Management
const DrawsManagement = ({ draws, onCreateDraw, onSimulateDraw, onPublishDraw, loading, error }) => {
  const [drawMonth, setDrawMonth] = useState(new Date().toISOString().split("T")[0]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Draw Management</h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={drawMonth}
            onChange={(e) => setDrawMonth(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
          <button
            onClick={() => onCreateDraw({ drawMonth, drawType: "RANDOM" })}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60"
          >
          Create New Draw
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Month</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Participants</th>
              <th className="px-4 py-3 font-semibold">Prize Pool</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {draws?.map((draw) => (
              <tr key={draw._id ?? draw.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {new Date(draw.drawMonth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long"
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    draw.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : draw.status === "SIMULATED"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {draw.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{draw.participantCount}</td>
                <td className="px-4 py-3">${(draw.totalPrizePool / 100).toFixed(2)}</td>
                <td className="px-4 py-3 space-x-2">
                  {draw.status === "DRAFT" && (
                    <>
                      <button
                        onClick={() => onSimulateDraw(draw._id ?? draw.id)}
                        disabled={loading}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
                      >
                        Simulate
                      </button>
                    </>
                  )}
                  {draw.status === "SIMULATED" && (
                    <button
                      onClick={() => onPublishDraw(draw._id ?? draw.id)}
                      disabled={loading}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-60"
                    >
                      Publish
                    </button>
                  )}
                  {draw.status === "PUBLISHED" && (
                    <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                      View Results
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Winners Management
const WinnersManagement = ({ pendingWinners, onApprove, onReject, loading, error }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Winner Verification</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {pendingWinners && pendingWinners.length > 0 ? (
        <div className="space-y-4">
          {pendingWinners.map((winner) => (
            <div key={winner._id ?? winner.id} className="border-2 border-yellow-200 p-4 rounded-lg bg-yellow-50">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Winner</p>
                  <p className="font-bold">{winner.userId?.fullName}</p>
                  <p className="text-sm text-gray-600">{winner.userId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Win Details</p>
                  <p className="font-bold">{winner.matchType} Match</p>
                  <p className="text-lg text-green-600 font-bold">
                    ${(winner.winAmount / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {winner.proofScreenshotUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Proof Screenshot</p>
                  <img
                    src={winner.proofScreenshotUrl}
                    alt="Proof"
                    className="max-w-xs rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => onApprove(winner._id ?? winner.id)}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = window.prompt("Enter rejection reason:", "Insufficient proof provided");
                    if (reason && reason.trim()) {
                      onReject(winner._id ?? winner.id, reason.trim());
                    }
                  }}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">No pending verifications</p>
      )}
    </div>
  );
};

// Users Management placeholder
const UsersManagement = ({ users }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">User Management</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-4 py-3 font-semibold">Name</th>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Subscription</th>
            <th className="px-4 py-3 font-semibold">Charity</th>
          </tr>
        </thead>
        <tbody>
          {users?.map((user) => (
            <tr key={user._id ?? user.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{user.fullName}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.role}</td>
              <td className="px-4 py-3">{user.isSubscribed ? "ACTIVE" : "INACTIVE"}</td>
              <td className="px-4 py-3">{user.selectedCharityId?.name || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CharitiesManagement = ({ charities, onCreateCharity, onDeleteCharity, loading, error }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    website: "",
    email: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    onCreateCharity({
      name: formData.name.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim() || undefined,
      website: formData.website.trim() || undefined,
      email: formData.email.trim() || undefined
    });

    setFormData({ name: "", description: "", imageUrl: "", website: "", email: "" });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Charity Management</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
        <input
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="rounded-lg border px-3 py-2"
          placeholder="Charity name"
          required
        />
        <input
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="rounded-lg border px-3 py-2"
          placeholder="Email (optional)"
        />
        <input
          value={formData.website}
          onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
          className="rounded-lg border px-3 py-2"
          placeholder="Website URL (optional)"
        />
        <input
          value={formData.imageUrl}
          onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
          className="rounded-lg border px-3 py-2"
          placeholder="Image URL (optional)"
        />
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="rounded-lg border px-3 py-2 md:col-span-2"
          placeholder="Description"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60 md:col-span-2"
        >
          {loading ? "Saving..." : "Add Charity"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 font-semibold">Supporters</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {charities?.map((charity) => (
              <tr key={charity._id ?? charity.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{charity.name}</td>
                <td className="px-4 py-3">{charity.isFeatured ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{charity.supporters || 0}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDeleteCharity(charity._id ?? charity.id)}
                    disabled={loading}
                    className="rounded bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AnalyticsView = ({ winnerStats, drawsCount, usersCount, charitiesCount }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold mb-4">Analytics</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard title="Total Users" value={usersCount} bgColor="bg-indigo-50" textColor="text-indigo-600" />
      <MetricCard title="Total Draws" value={drawsCount} bgColor="bg-cyan-50" textColor="text-cyan-600" />
      <MetricCard title="Total Charities" value={charitiesCount} bgColor="bg-emerald-50" textColor="text-emerald-600" />
      <MetricCard
        title="Total Paid Out"
        value={`$${((winnerStats?.totalPaidOut || 0) / 100).toFixed(2)}`}
        bgColor="bg-amber-50"
        textColor="text-amber-700"
      />
    </div>
  </div>
);

export default AdminDashboardPage;
