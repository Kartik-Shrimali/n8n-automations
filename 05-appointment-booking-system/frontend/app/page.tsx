"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";

const TIME_SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type Status = "idle" | "submitting" | "success" | "error";

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = date && time && name.trim() && phone.trim() && status !== "submitting";

  async function handleSubmit() {
    if (!date || !time) return;
    setStatus("submitting");
    setErrorMsg("");

    const appointmentDatetime = `${format(date, "yyyy-MM-dd")}T${time}:00`;

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentDatetime,
          clientName: name.trim(),
          clientPhone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.message || "This slot is no longer available.");
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
              Confirmed
            </span>
          </div>
          <h1 className="font-display text-2xl mb-2 text-[#F4F1EA]">You're booked.</h1>
          <p className="text-[#9AA3B2] text-sm mb-1">
            {date && format(date, "EEEE, MMMM d")} at {time}
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
        <p className="text-xs uppercase tracking-widest text-[#E0975A] mb-3">Schedule a visit</p>
        <h1 className="font-display text-3xl text-[#F4F1EA]">Book your appointment</h1>
      </div>

      <div className="max-w-md w-full bg-[#1E2027] border border-[#2B2E37] rounded-2xl p-6 shadow-sm">
        <DayPicker
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={{ before: new Date() }}
          className="mx-auto"
        />

        {date && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-[#9AA3B2] mb-3">Available times</p>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`text-sm py-2 rounded-lg border transition ${time === slot
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

        {date && time && (
          <div className="mt-6 space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#15161B] border border-[#2B2E37] rounded-lg px-4 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#E0975A]"
            />
            <input
              type="tel"
              placeholder="WhatsApp number (e.g. +91XXXXXXXXXX)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#15161B] border border-[#2B2E37] rounded-lg px-4 py-2 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#E0975A]"
            />
          </div>
        )}

        {status === "error" && <p className="mt-4 text-sm text-red-400">{errorMsg}</p>}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full bg-[#E0975A] text-[#15161B] text-sm font-medium py-3 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D98E4A] transition"
        >
          {status === "submitting" ? "Booking..." : "Confirm appointment"}
        </button>

        <div className="mt-4 text-center">
          <a
            href="/reschedule"
            className="text-[#E0975A] text-sm underline"
          >
            Need to change your time?
          </a>
        </div>
      </div>
    </main>
  );
}