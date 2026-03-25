import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getFeaturedCharitiesRequest } from "../api/golf";
import { checkSubscriptionStatusRequest } from "../api/golf";

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: charities } = useQuery({
    queryKey: ["featuredCharities"],
    queryFn: getFeaturedCharitiesRequest
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscriptionStatus"],
    queryFn: checkSubscriptionStatusRequest,
    retry: false
  });

  const handleSubscribe = () => {
    if (subscriptionStatus?.isSubscribed) {
      navigate("/dashboard");
    } else {
      navigate("/subscription");
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-800 px-8 py-20 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">
            Golf. Charity. Community.
          </h1>
          <p className="text-xl mb-8 text-green-50">
            Track your golf performance, participate in monthly draws, and support charities you care about. When you win, so does the cause you believe in.
          </p>
          <button
            onClick={handleSubscribe}
            className="bg-white text-green-700 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition transform hover:scale-105"
          >
            {subscriptionStatus?.isSubscribed ? "Go to Dashboard" : "Start Your Journey"}
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-4xl font-bold text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate("/subscription")}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-left"
          >
            <div className="text-4xl font-bold text-green-600 mb-4">1</div>
            <h3 className="text-xl font-bold mb-2">Subscribe</h3>
            <p className="text-gray-600">
              Choose monthly or yearly subscription. At least 10% goes to charities of your choice.
            </p>
          </button>
          <button
            onClick={() => navigate("/prizes")}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-left"
          >
            <div className="text-4xl font-bold text-green-600 mb-4">2</div>
            <h3 className="text-xl font-bold mb-2">Track Scores</h3>
            <p className="text-gray-600">
              Enter your last 5 golf scores in Stableford format. Scores automatically enter you into draws.
            </p>
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition text-left"
          >
            <div className="text-4xl font-bold text-green-600 mb-4">3</div>
            <h3 className="text-xl font-bold mb-2">Win Prizes</h3>
            <p className="text-gray-600">
              Monthly draws match your scores against winning numbers. 5-match wins the jackpot!
            </p>
          </button>
        </div>
      </section>

      {/* Charity Impact */}
      <section className="bg-blue-50 rounded-2xl p-12 space-y-8">
        <h2 className="text-4xl font-bold text-center">Make a Real Impact</h2>
        <p className="text-center text-gray-700 max-w-2xl mx-auto">
          Every subscription directly supports charities making a difference. Your money, your choice. Your wins help even more.
        </p>
        
        {charities && charities.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {charities.map((charity) => (
              <div key={charity._id ?? charity.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                {charity.imageUrl && (
                  <img
                    src={charity.imageUrl}
                    alt={charity.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-bold text-lg mb-2">{charity.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{charity.description}</p>
                {charity.website && (
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-semibold"
                  >
                    Learn More →
                  </a>
                )}
                <button
                  onClick={() =>
                    navigate("/subscription", {
                      state: {
                        selectedCharityId: charity._id ?? charity.id,
                        selectedCharityName: charity.name
                      }
                    })
                  }
                  className="mt-3 w-full rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-200"
                >
                  Support This Charity
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => navigate("/charities")}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Browse All Charities
          </button>
        </div>
      </section>

      {/* Prize Structure */}
      <section className="space-y-8">
        <h2 className="text-4xl font-bold text-center">Prize Structure</h2>
        <div className="bg-gradient-to-r from-yellow-50 to-purple-50 p-8 rounded-xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">40%</div>
              <p className="font-bold mb-2">5-Number Match (Jackpot)</p>
              <p className="text-gray-600">Largest prize pool including carryovers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-600 mb-2">35%</div>
              <p className="font-bold mb-2">4-Number Match</p>
              <p className="text-gray-600">Split equally among winners</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">25%</div>
              <p className="font-bold mb-2">3-Number Match</p>
              <p className="text-gray-600">Most frequent prize tier</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-6 py-12">
        <h2 className="text-4xl font-bold">Ready to Make a Difference?</h2>
        <button
          onClick={handleSubscribe}
          className="bg-green-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition transform hover:scale-105"
        >
          {subscriptionStatus?.isSubscribed ? "Access Your Dashboard" : "Subscribe Now"}
        </button>
      </section>
    </div>
  );
};
