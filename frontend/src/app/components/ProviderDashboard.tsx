"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

interface ProviderProfile {
  id: number;
  name: string;
  skills: string[];
  rating: number;
  location: string;
  service_focus: string;
  created_at: string;
}

export default function ProviderDashboard() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [editedProfile, setEditedProfile] = useState<Partial<ProviderProfile>>(
    {}
  );
  const { token, user } = useAuth();

  const serviceFocusOptions = [
    "Technology & Software",
    "Healthcare & Medical",
    "Education & Training",
    "Finance & Accounting",
    "Marketing & Advertising",
    "Design & Creative",
    "Business & Consulting",
    "Engineering & Manufacturing",
    "Retail & E-commerce",
    "Hospitality & Food Service",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/providers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        const userProfile = Array.isArray(data)
          ? data.find((p) => p.user_id === user?.id)
          : null;

        if (!userProfile) {
          setError("Failed to load profile: No provider profile found");
        } else {
          setProfile(userProfile);
          setEditedProfile(userProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, user?.id]);

  const handleSkillAdd = () => {
    if (skillInput.trim() && editedProfile.skills) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleSkillRemove = (indexToRemove: number) => {
    if (editedProfile.skills) {
      setEditedProfile({
        ...editedProfile,
        skills: editedProfile.skills.filter(
          (_, index) => index !== indexToRemove
        ),
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/providers/${profile?.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedProfile),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Profile Information
          </h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    value={editedProfile.name || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                {editMode ? (
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    value={editedProfile.location || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        location: e.target.value,
                      })
                    }
                    placeholder="Enter your location"
                  />
                ) : (
                  <div className="mt-1 flex items-center text-gray-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1 text-gray-500"
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
                    <span>{profile?.location || "Location not specified"}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Skills
                </label>
                {editMode ? (
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Add a skill"
                      />
                      <button
                        type="button"
                        onClick={handleSkillAdd}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editedProfile.skills?.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profile?.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <div className="mt-1 flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{profile?.rating.toFixed(1)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Service Focus
                </label>
                {editMode ? (
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    value={editedProfile.service_focus || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        service_focus: e.target.value,
                      })
                    }
                  >
                    <option value="">Select a service focus</option>
                    {serviceFocusOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900">
                    {profile?.service_focus || "Not specified"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
