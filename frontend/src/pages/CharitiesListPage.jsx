import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCharitiesRequest } from "../api/golf";

const LOCAL_CHARITIES = [
  {
    id: "local-charity-1",
    name: "Youth Golf Foundation",
    description: "Supports youth golf training, coaching camps, and equipment grants.",
    supporters: 120,
    totalContributed: 540000,
    tags: ["youth", "golf", "education"]
  },
  {
    id: "local-charity-2",
    name: "Green Earth Course Initiative",
    description: "Funds sustainable golf course maintenance and water-saving projects.",
    supporters: 86,
    totalContributed: 410000,
    tags: ["environment", "green", "course"]
  },
  {
    id: "local-charity-3",
    name: "Community Sports Access",
    description: "Provides sports scholarships for underrepresented local communities.",
    supporters: 202,
    totalContributed: 720000,
    tags: ["community", "scholarship", "sports"]
  }
];

export const CharitiesListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: charities, isLoading } = useQuery({
    queryKey: ["charities", search],
    queryFn: () => listCharitiesRequest(search, false)
  });

  const searchableCharities = useMemo(() => {
    const source = Array.isArray(charities) && charities.length > 0 ? charities : LOCAL_CHARITIES;
    const term = search.trim().toLowerCase();

    if (!term) return source;

    return source.filter((charity) => {
      const name = charity.name?.toLowerCase() || "";
      const description = charity.description?.toLowerCase() || "";
      const tags = Array.isArray(charity.tags) ? charity.tags.join(" ").toLowerCase() : "";
      return name.includes(term) || description.includes(term) || tags.includes(term);
    });
  }, [charities, search]);

  if (isLoading) {
    return <div className="text-center py-12">Loading charities...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Supported Charities</h1>
        <p className="text-gray-600 max-w-xl">
          Choose a charity to support. A minimum of 10% of your subscription goes directly to your selected charity.
        </p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search charities (example: youth, environment, community)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-6 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {["youth", "environment", "community"].map((term) => (
            <button
              key={term}
              onClick={() => setSearch(term)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {term}
            </button>
          ))}
          <button
            onClick={() => setSearch("")}
            className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            clear
          </button>
        </div>
      </div>

      {/* Charities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchableCharities?.map((charity) => (
          <div
            key={charity._id ?? charity.id}
            onClick={() =>
              navigate("/subscription", {
                state: {
                  selectedCharityId: charity._id ?? charity.id,
                  selectedCharityName: charity.name
                }
              })
            }
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
          >
            {charity.imageUrl && (
              <img
                src={charity.imageUrl}
                alt={charity.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold">{charity.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{charity.description}</p>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500">Supporters</p>
                  <p className="font-bold">{charity.supporters}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Contributed</p>
                  <p className="font-bold">${(charity.totalContributed / 100).toFixed(0)}</p>
                </div>
              </div>

              {charity.website && (
                <a
                  href={charity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block text-center bg-blue-100 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-200 transition text-sm"
                >
                  Visit Website
                </a>
              )}
              <button className="block w-full text-center bg-green-100 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-200 transition text-sm">
                Support This Charity
              </button>
            </div>
          </div>
        ))}
      </div>

      {searchableCharities?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No charities found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default CharitiesListPage;
