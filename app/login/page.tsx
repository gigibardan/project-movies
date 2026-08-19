'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Film, Lock } from 'lucide-react';

export default function LoginPage() {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const pin = newDigits.join('');
      if (pin.length === 4) {
        submit(pin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const newDigits = pasted.split('');
      setDigits(newDigits);
      submit(pasted);
    }
  };

  const submit = async (pin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        const from = searchParams.get('from') || '/';
        window.location.href = from;
      } else {
        setError(true);
        setDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <Film className="h-12 w-12 text-red-500" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Cine<span className="text-red-500">Stream</span>
          </h1>
        </div>

        {/* PIN card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <Lock className="h-5 w-5 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-400">Enter PIN to continue</p>
          </div>

          {/* PIN inputs */}
          <div className="flex justify-center gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                disabled={loading}
                className={`h-14 w-14 rounded-xl border bg-white/5 text-center text-2xl font-bold text-white outline-none transition-all
                  ${error ? 'border-red-500 animate-[shake_0.3s_ease-in-out]' : 'border-white/10 focus:border-red-500/60 focus:bg-white/[0.07]'}
                  ${loading ? 'opacity-50' : ''}
                `}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 text-center text-sm font-medium text-red-400">
              Wrong PIN. Try again.
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Private access only
        </p>
      </div>
    </div>
  );
}