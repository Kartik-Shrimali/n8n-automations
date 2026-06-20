"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit() {
    setStatus("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submit failed");
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#1B2421] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#FAF8F4] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Left panel */}
        <div className="md:w-2/5 bg-[#1B2421] p-10 flex flex-col justify-between">
          <div>
            <span className="text-[#D98E3D] text-xs uppercase tracking-[0.2em] font-medium" style={{ fontFamily: "var(--font-body)" }}>
              Contact
            </span>
            <h1
              className="text-[#FAF8F4] text-4xl mt-4 leading-tight"
              style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
            >
              Tell us what you need.
            </h1>
          </div>
          <p className="text-[#7C8A78] text-sm mt-8" style={{ fontFamily: "var(--font-body)" }}>
            We read every message and follow up based on what matters most to you.
          </p>
        </div>

        {/* Right panel — form */}
        <div className="md:w-3/5 p-10">
          <div className="space-y-5">
            <div>
              <label className="block text-[#7C8A78] text-xs uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-body)" }}>
                Name
              </label>
              <input
                className="w-full border border-[#D9D4C8] rounded-lg px-3 py-2.5 text-[#22281F] focus:outline-none focus:ring-2 focus:ring-[#D98E3D] focus:border-transparent transition"
                style={{ fontFamily: "var(--font-body)" }}
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[#7C8A78] text-xs uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-body)" }}>
                Email
              </label>
              <input
                className="w-full border border-[#D9D4C8] rounded-lg px-3 py-2.5 text-[#22281F] focus:outline-none focus:ring-2 focus:ring-[#D98E3D] focus:border-transparent transition"
                style={{ fontFamily: "var(--font-body)" }}
                placeholder="you@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[#7C8A78] text-xs uppercase tracking-wider mb-1.5" style={{ fontFamily: "var(--font-body)" }}>
                Message
              </label>
              <textarea
                className="w-full border border-[#D9D4C8] rounded-lg px-3 py-2.5 text-[#22281F] focus:outline-none focus:ring-2 focus:ring-[#D98E3D] focus:border-transparent transition resize-none"
                style={{ fontFamily: "var(--font-body)" }}
                placeholder="How can we help?"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={status === "loading"}
              className="w-full bg-[#D98E3D] hover:bg-[#C27D32] text-[#1B2421] font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {status === "loading" ? "Sending…" : "Send message"}
            </button>

            <p className="text-[#7C8A78] text-xs text-center" style={{ fontFamily: "var(--font-body)" }}>
              Replies are prioritized by urgency.
            </p>

            {status === "success" && (
              <p className="text-[#5B7A5B] text-sm text-center">Thanks — we'll be in touch soon.</p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-sm text-center">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}