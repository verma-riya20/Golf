import { client } from "./client";

const DEMO_SUBSCRIPTION_KEY = "demoSubscription";
const DEMO_SCORES_KEY = "demoScores";

const getDemoSubscription = () => {
  try {
    const raw = localStorage.getItem(DEMO_SUBSCRIPTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getDemoScores = () => {
  try {
    const raw = localStorage.getItem(DEMO_SCORES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setDemoScores = (scores) => {
  localStorage.setItem(DEMO_SCORES_KEY, JSON.stringify(scores));
};

const buildDemoScoreStats = () => {
  const scores = getDemoScores();

  if (!scores.length) {
    return {
      count: 0,
      average: 0,
      best: null,
      worst: null,
      scores: []
    };
  }

  const values = scores.map((s) => Number(s.score));
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;

  return {
    count: scores.length,
    average: Number(average.toFixed(2)),
    best: Math.max(...values),
    worst: Math.min(...values),
    scores
  };
};

export const setDemoSubscriptionStatus = ({ planType, charityName, charityPercentage, amount }) => {
  const now = new Date();
  const renewalDate = new Date(now);
  if (planType === "YEARLY") {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  }

  const data = {
    isSubscribed: true,
    status: "ACTIVE",
    daysRemaining: Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24)),
    subscription: {
      planType,
      renewalDate: renewalDate.toISOString(),
      charityName,
      charityPercentage,
      price: Math.round(amount * 100)
    },
    source: "DEMO"
  };

  localStorage.setItem(DEMO_SUBSCRIPTION_KEY, JSON.stringify(data));
  return data;
};

// Subscriptions
export const createSubscriptionRequest = (planType, charityId, charityPercentage) =>
  client
    .post("/subscriptions", { planType, charityId, charityPercentage })
    .then((res) => res.data);

export const getUserSubscriptionRequest = () =>
  client.get("/subscriptions").then((res) => res.data);

export const checkSubscriptionStatusRequest = async () => {
  const demoSubscription = getDemoSubscription();

  try {
    const { data } = await client.get("/subscriptions/status/check");

    if (data?.status === "ACTIVE") {
      return data;
    }

    return demoSubscription || data;
  } catch (error) {
    if (demoSubscription) {
      return demoSubscription;
    }
    throw error;
  }
};

export const cancelSubscriptionRequest = () =>
  client.delete("/subscriptions").then((res) => {
    localStorage.removeItem(DEMO_SUBSCRIPTION_KEY);
    localStorage.removeItem(DEMO_SCORES_KEY);
    return res.data;
  });

// Golf Scores
export const addGolfScoreRequest = (score, date, courseInfo) =>
  client.post("/scores", { score, date, courseInfo }).then((res) => res.data).catch((error) => {
    const demoSubscription = getDemoSubscription();
    const isDemoActive = demoSubscription?.isSubscribed && demoSubscription?.source === "DEMO";

    if (!isDemoActive) {
      throw error;
    }

    const newScore = {
      id: `demo-${Date.now()}`,
      score,
      date,
      courseInfo: courseInfo || null,
      createdAt: new Date().toISOString()
    };

    const current = getDemoScores();
    const next = [newScore, ...current]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    setDemoScores(next);
    return newScore;
  });

export const getUserScoresRequest = () =>
  client.get("/scores").then((res) => res.data);

export const getScoreStatsRequest = () =>
  client.get("/scores/stats").then((res) => {
    const backendData = res.data;
    const demoSubscription = getDemoSubscription();
    const isDemoActive = demoSubscription?.isSubscribed && demoSubscription?.source === "DEMO";

    if (isDemoActive) {
      return buildDemoScoreStats();
    }

    return backendData;
  }).catch((error) => {
    const demoSubscription = getDemoSubscription();
    const isDemoActive = demoSubscription?.isSubscribed && demoSubscription?.source === "DEMO";

    if (!isDemoActive) {
      throw error;
    }

    return buildDemoScoreStats();
  });

export const updateGolfScoreRequest = (scoreId, score, date, courseInfo) =>
  client.put(`/scores/${scoreId}`, { score, date, courseInfo }).then((res) => res.data);

export const deleteGolfScoreRequest = (scoreId) =>
  client.delete(`/scores/${scoreId}`).then((res) => res.data);

// Charities
export const listCharitiesRequest = (search, featured) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (featured !== undefined && featured !== null) params.append("featured", String(featured));
  return client.get(`/charities?${params.toString()}`).then((res) => res.data);
};

export const getCharityRequest = (charityId) =>
  client.get(`/charities/${charityId}`).then((res) => res.data);

export const getFeaturedCharitiesRequest = () =>
  client.get("/charities/featured").then((res) => res.data);

export const selectCharityRequest = (charityId, charityPercentage) =>
  client.post("/charities/select", { charityId, charityPercentage }).then((res) => res.data);

export const createCharityRequest = (name, description, imageUrl, website, email) =>
  client.post("/charities", { name, description, imageUrl, website, email }).then((res) => res.data);

export const updateCharityRequest = (charityId, data) =>
  client.put(`/charities/${charityId}`, data).then((res) => res.data);

export const deleteCharityRequest = (charityId) =>
  client.delete(`/charities/${charityId}`).then((res) => res.data);

// Draws
export const listDrawsRequest = (status) => {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  return client.get(`/draws?${params.toString()}`).then((res) => res.data);
};

// Backward-compatible alias used by dashboard pages.
export const getDrawsRequest = listDrawsRequest;

export const getDrawRequest = (drawId) =>
  client.get(`/draws/${drawId}`).then((res) => res.data);

export const createDrawRequest = (drawMonth, drawType) =>
  client.post("/draws", { drawMonth, drawType }).then((res) => res.data);

export const simulateDrawRequest = (drawId) =>
  client.post(`/draws/${drawId}/simulate`).then((res) => res.data);

export const publishDrawResultsRequest = (drawId) =>
  client.post(`/draws/${drawId}/publish`).then((res) => res.data);

export const getUserDrawParticipationRequest = () =>
  client.get("/draws/user/participation").then((res) => res.data);

// Winners
export const getUserWinsRequest = () =>
  client.get("/winners/user/wins").then((res) => res.data);

export const getWinnerRequest = (winnerId) =>
  client.get(`/winners/${winnerId}`).then((res) => res.data);

export const submitWinnerProofRequest = (winnerId, proofScreenshotUrl) =>
  client.post(`/winners/${winnerId}/proof`, { proofScreenshotUrl }).then((res) => res.data);

export const getPendingWinnersRequest = () =>
  client.get("/winners/admin/pending").then((res) => res.data);

export const approveWinnerRequest = (winnerId) =>
  client.post(`/winners/${winnerId}/approve`).then((res) => res.data);

export const rejectWinnerRequest = (winnerId, rejectionReason) =>
  client.post(`/winners/${winnerId}/reject`, { rejectionReason }).then((res) => res.data);

export const markWinnerAsPaidRequest = (winnerId, stripePayoutId) =>
  client.post(`/winners/${winnerId}/mark-paid`, { stripePayoutId }).then((res) => res.data);

export const getAllWinnersRequest = (drawId, verificationStatus, paymentStatus) => {
  const params = new URLSearchParams();
  if (drawId) params.append("drawId", drawId);
  if (verificationStatus) params.append("verificationStatus", verificationStatus);
  if (paymentStatus) params.append("paymentStatus", paymentStatus);
  return client.get(`/winners/admin/all?${params.toString()}`).then((res) => res.data);
};

export const getWinnerStatsRequest = () =>
  client.get("/winners/admin/stats").then((res) => res.data);

// Admin Users
export const listUsersRequest = () =>
  client.get("/users").then((res) => res.data);
