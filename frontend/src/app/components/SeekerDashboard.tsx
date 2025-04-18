"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface Provider {
  id: number;
  name: string;
  skills: string[];
  rating: number;
  location: string;
  service_focus: string;
  match_score: number;
  created_at: string;
}

//TODO: Implement a rating system for providers & contact provider functionality

export default function SeekerDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/match/providers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch providers");
        }

        const data = await response.json();
        setProviders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setError("Failed to load providers");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [token]);

  // Get unique skills from all providers
  const allSkills = Array.from(
    new Set(providers.flatMap((provider) => provider.skills))
  ).sort();

  // Filter providers based on search term and selected skill
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch = provider.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSkill =
      !selectedSkill || provider.skills.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Find Service Providers
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search by name
            </label>
            <input
              type="text"
              id="search"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="skill"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by skill
            </label>
            <select
              id="skill"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">All Skills</option>
              {allSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProviders.length === 0 ? (
            <p className="text-center text-gray-500">
              No providers found matching your criteria.
            </p>
          ) : (
            filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {provider.name}
                    </h2>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500 text-xl">★</span>
                      <span className="ml-1 text-gray-900">
                        {provider.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      Match Score
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(provider.match_score)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center mb-4 text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{provider.location || "Location not specified"}</span>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Service Focus
                  </div>
                  <div className="text-gray-900">{provider.service_focus}</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  Joined: {new Date(provider.created_at).toLocaleDateString()}
                </div>

                <button
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    /* TODO: Implement contact/booking functionality */
                  }}
                >
                  Contact Provider
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
