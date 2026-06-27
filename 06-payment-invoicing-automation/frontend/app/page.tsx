'use client';

import { useState } from 'react';

type InvoiceResult = {
  success?: boolean;
  paymentLink?: string;
  invoiceId?: string;
  message?: string;
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-4">
    <label className="w-28 shrink-0 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-[#7A6A50] font-semibold">
      {label}
    </label>
    {children}
  </div>
);

export default function Home() {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    amount: '',
    description: '',
    dueDate: '',
  });
  
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const parsedAmount = Number(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setResult({ success: false, message: 'Invalid amount entered.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amount: parsedAmount }),
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Invoice failed:', error);
      setResult({ success: false, message: 'Server communication failed.' });
    } finally {
      setLoading(false);
    }
  };

  const stampClass = result?.paymentLink
    ? 'stamp-animate inline-block border-4 px-5 py-2 rotate-[-4deg] border-[#3E5C35] text-[#3E5C35]'
    : 'stamp-animate inline-block border-4 px-5 py-2 rotate-[-4deg] border-[#7A2A1F] text-[#7A2A1F]';

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div
        className="relative w-full max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all"
        style={{
          backgroundColor: '#F4ECE1',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 40px, rgba(42,33,24,0.04) 40px, rgba(42,33,24,0.04) 41px)',
        }}
      >
        {/* Ledger Header Bar */}
        <div className="h-4 w-full bg-[#2A2118] border-b-4 border-[#7A2A1F]" />

        {/* Vertical alignment line */}
        <div className="hidden sm:block absolute left-12 top-4 bottom-0 w-px bg-[#7A2A1F]/30" />

        <div className="px-6 py-10 sm:px-16 sm:py-14">
          <header className="mb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-black text-[#2A2118] tracking-tight">
                INVOICE
              </h1>
              <p className="font-[family-name:var(--font-mono)] text-xs text-[#7A6A50] mt-2 uppercase tracking-widest">
                Issue / Generate
              </p>
            </div>
            
            <div className="bg-[#2A2118] px-4 py-2 border border-[#A1813A]">
              <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.2em] text-[#C9A86A]">
                NO. {result?.invoiceId ?? 'DRAFT'}
              </span>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="divide-y divide-[#2A2118]/10">
            <Row label="Bill to">
              <input
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="flex-1 w-full bg-transparent border-b-2 border-dotted border-[#2A2118]/40 focus:border-solid focus:border-[#7A2A1F] outline-none py-1 text-[#2A2118] placeholder:text-[#2A2118]/30 transition-colors"
                placeholder="Client Name"
                required
              />
            </Row>

            <Row label="Phone">
              <input
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="flex-1 w-full bg-transparent border-b-2 border-dotted border-[#2A2118]/40 focus:border-solid focus:border-[#7A2A1F] outline-none py-1 font-[family-name:var(--font-mono)] text-[#2A2118] placeholder:text-[#2A2118]/30 transition-colors"
                placeholder="+91..."
                required
              />
            </Row>

            <Row label="Email">
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="flex-1 w-full bg-transparent border-b-2 border-dotted border-[#2A2118]/40 focus:border-solid focus:border-[#7A2A1F] outline-none py-1 font-[family-name:var(--font-mono)] text-[#2A2118] placeholder:text-[#2A2118]/30 transition-colors"
                placeholder="client@example.com"
                required
              />
            </Row>

            <Row label="Amount">
              <div className="flex-1 w-full flex items-baseline gap-2 border-b-2 border-dotted border-[#2A2118]/40 focus-within:border-solid focus-within:border-[#7A2A1F] py-1 transition-colors">
                <span className="font-[family-name:var(--font-mono)] text-[#7A6A50]">₹</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="flex-1 bg-transparent outline-none font-[family-name:var(--font-mono)] text-lg text-[#2A2118] placeholder:text-[#2A2118]/30"
                  placeholder="0.00"
                  required
                />
              </div>
            </Row>

            <Row label="For">
              <input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="flex-1 w-full bg-transparent border-b-2 border-dotted border-[#2A2118]/40 focus:border-solid focus:border-[#7A2A1F] outline-none py-1 text-[#2A2118] placeholder:text-[#2A2118]/30 transition-colors"
                placeholder="Project Description"
                required
              />
            </Row>

            <Row label="Due by">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="flex-1 w-full bg-transparent border-b-2 border-dotted border-[#2A2118]/40 focus:border-solid focus:border-[#7A2A1F] outline-none py-1 font-[family-name:var(--font-mono)] text-[#2A2118] transition-colors"
                required
              />
            </Row>

            <div className="pt-10 pb-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#2A2118] text-[#F4ECE1] font-semibold text-xs uppercase tracking-widest rotate-[-1deg] hover:rotate-0 hover:bg-[#7A2A1F] transition-all disabled:opacity-50 disabled:hover:rotate-[-1deg] disabled:hover:bg-[#2A2118] shadow-[4px_4px_0_rgba(122,42,31,0.5)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {loading ? 'Processing...' : 'Authorize Invoice'}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-10 pt-8 border-t-2 border-dashed border-[#2A2118]/20 bg-[#2A2118]/5 p-6 -mx-6 sm:mx-0 sm:px-8">
              <div className="flex flex-col items-start gap-4">
                <div className={stampClass}>
                  <span className="font-[family-name:var(--font-display)] font-[900] text-2xl uppercase tracking-wider">
                    {result.paymentLink ? 'AUTHORIZED' : 'REJECTED'}
                  </span>
                </div>

                {result.paymentLink ? (
                  <div className="w-full mt-4 bg-white p-4 border border-[#2A2118]/20 shadow-inner">
                    <p className="text-[10px] uppercase tracking-widest text-[#7A6A50] mb-2 font-semibold">
                      Generated Payment Link
                    </p>
                    <a
                      href={result.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-[family-name:var(--font-mono)] text-sm text-[#3E5C35] hover:text-[#7A2A1F] underline break-all transition-colors"
                    >
                      {result.paymentLink}
                    </a>
                  </div>
                ) : (
                  <div className="w-full mt-2 border-l-4 border-[#7A2A1F] pl-4">
                    <p className="text-[11px] uppercase tracking-wider text-[#7A2A1F] font-bold mb-1">Error Code</p>
                    <p className="font-[family-name:var(--font-mono)] text-sm text-[#2A2118]">
                      {result.message || 'System failure.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}