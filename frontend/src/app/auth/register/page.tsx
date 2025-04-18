"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "seeker" as "seeker" | "provider",
    location: "",
    industry_preference: "",
    service_focus: "",
    name: "",
    skills: [] as string[],
  });
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  // Predefined options for dropdowns
  const industryOptions = [
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillAdd = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      router.push("/");
    } catch (error) {
      console.log(error);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="seeker">Seeker</option>
                <option value="provider">Provider</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {formData.role === "seeker" && (
              <div>
                <label
                  htmlFor="industry_preference"
                  className="block text-sm font-medium text-gray-700"
                >
                  Industry Preference
                </label>
                <select
                  id="industry_preference"
                  name="industry_preference"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                  value={formData.industry_preference}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an industry</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.role === "provider" && (
              <>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Provider Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="service_focus"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Service Focus
                  </label>
                  <select
                    id="service_focus"
                    name="service_focus"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                    value={formData.service_focus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service focus</option>
                    {serviceFocusOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <div className="mt-1 flex space-x-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={handleSkillAdd}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              skills: formData.skills.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Register
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
