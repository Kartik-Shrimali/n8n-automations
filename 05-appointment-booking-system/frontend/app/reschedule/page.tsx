"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";

const TIME_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type Status = "idle" | "submitting" | "success" | "error";

export default function ReschedulePage() {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = phone.trim() && date && time && status !== "submitting";

  async function handleSubmit() {
    if (!date || !time) return;
    setStatus("submitting");
    setErrorMsg("");

    const newDatetime = `${format(date, "yyyy-MM-dd")}T${time}:00`;

    try {
      const res = await fetch("/api/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), newDatetime }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.message || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#1E2027] border border-[#2B2E37] rounded-2xl p-10 text-center shadow-sm">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full border-2 border-dashed border-[#E0975A] flex items-center justify-center rotate-[-8deg] animate-[stampIn_0.4s_ease-out]">
            <span className="font-display text-[#E0975A] text-xs font-semibold tracking-widest uppercase">
              Updated
            </span>
          </div>
          <h1 className="font-display text-2xl mb-2 text-[#F4F1EA]">You're rescheduled.</h1>
          <p className="text-[#9AA3B2] text-sm mb-1">
            New time: {date && format(date, "EEEE, MMMM d")} at {time}
          </p>
          <p className="text-[#9AA3B2] text-sm">
            We'll send a reminder on WhatsApp before your appointment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16 flex flex-col items-center">
      <div className="max-w-md w-full mb-10 text-center">
        <p className="text-xs uppercase tracking-widest text-[#E0975A] mb-3">Change your time</p>
        <h1 className="font-display text-3xl text-[#F4F1EA]">Reschedule appointment</h1>
      </div>

      <div className="max-w-md w-full bg-[#1E2027] border border-[#2B2E37] rounded-2xl p-6 shadow-sm">
        <input
          type="tel"
          placeholder="WhatsApp number used to book (e.g. +91XXXXXXXXXX)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-[#15161B] border border-[#2B2E37] rounded-lg px-4 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#E0975A] mb-6"
        />

        <DayPicker
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={{ before: new Date() }}
          className="mx-auto"
        />

        {date && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-[#9AA3B2] mb-3">New time</p>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`text-sm py-2 rounded-lg border transition ${
                    time === slot
                      ? "bg-[#E0975A] text-[#15161B] border-[#E0975A]"
                      : "border-[#2B2E37] text-[#F4F1EA] hover:border-[#E0975A]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {status === "error" && <p className="mt-4 text-sm text-red-400">{errorMsg}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full bg-[#E0975A] text-[#15161B] text-sm font-medium py-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D98E4A] transition"
        >
          {status === "submitting" ? "Updating..." : "Confirm new time"}
        </button>
      </div>
    </main>
  );
}