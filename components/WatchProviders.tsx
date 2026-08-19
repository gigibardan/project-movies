'use client';

import Image from 'next/image';
import { ExternalLink, Monitor, ShoppingCart, DollarSign, Tv, Radio } from 'lucide-react';
import type { WatchProviderCountry, WatchProvider } from '@/lib/tmdb-types';
import { cn } from '@/lib/utils';

interface WatchProvidersProps {
  providers: Record<string, WatchProviderCountry> | undefined;
  title: string;
}

const COUNTRIES = [
  { code: 'RO', label: 'Romania' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
];

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  items: WatchProvider[];
  accent: string;
  badgeText: string;
}

function ProviderSection({ title, icon, items, accent, badgeText }: SectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', accent)}>
          {badgeText}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {items
          .sort((a, b) => a.display_priority - b.display_priority)
          .map((provider) => (
            <div
              key={provider.provider_id}
              className="group/p flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 transition-colors hover:border-white/15 hover:bg-white/[0.07]"
            >
              {provider.logo_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  width={28}
                  height={28}
                  className="rounded-md"
                />
              )}
              <span className="text-xs font-medium text-zinc-300 group-hover/p:text-white">
                {provider.provider_name}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function WatchProviders({ providers, title }: WatchProvidersProps) {
  if (!providers) return <NoProviders />;

  // Find first country with data
  const available = COUNTRIES.filter((c) => providers[c.code]);
  const primaryCountry = available.find((c) => c.code === 'RO') || available[0];

  if (!primaryCountry) return <NoProviders />;

  const data = providers[primaryCountry.code];
  const hasAny = data.flatrate?.length || data.rent?.length || data.buy?.length || data.ads?.length || data.free?.length;

  if (!hasAny) return <NoProviders />;

  return (
    <div className="mt-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white sm:text-2xl">Where to Watch</h2>
        {data.link && (
          <a
            href={data.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-red-400"
          >
            View on TMDB <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Country tabs */}
      {available.length > 1 && (
        <CountryTabs countries={available} providers={providers} title={title} />
      )}

      {available.length <= 1 && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">Region:</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">
              {primaryCountry.label}
            </span>
          </div>

          <div className="space-y-5">
            <ProviderSection
              title="Stream"
              icon={<Monitor className="h-4 w-4 text-emerald-400" />}
              items={data.flatrate || []}
              accent="bg-emerald-500/10 text-emerald-400"
              badgeText="Subscription"
            />
            <ProviderSection
              title="Free with Ads"
              icon={<Radio className="h-4 w-4 text-blue-400" />}
              items={[...(data.ads || []), ...(data.free || [])]}
              accent="bg-blue-500/10 text-blue-400"
              badgeText="Free"
            />
            <ProviderSection
              title="Rent"
              icon={<DollarSign className="h-4 w-4 text-yellow-400" />}
              items={data.rent || []}
              accent="bg-yellow-500/10 text-yellow-400"
              badgeText="From $2.99"
            />
            <ProviderSection
              title="Buy"
              icon={<ShoppingCart className="h-4 w-4 text-orange-400" />}
              items={data.buy || []}
              accent="bg-orange-500/10 text-orange-400"
              badgeText="Own it"
            />
          </div>

          <p className="mt-5 text-[10px] text-zinc-600">
            Streaming data provided by JustWatch via TMDB. Availability may vary.
          </p>
        </div>
      )}
    </div>
  );
}

function CountryTabs({
  countries,
  providers,
  title,
}: {
  countries: { code: string; label: string }[];
  providers: Record<string, WatchProviderCountry>;
  title: string;
}) {
  const [selected, setSelected] = require('react').useState(
    countries.find((c) => c.code === 'RO')?.code || countries[0]?.code
  );

  const data = providers[selected];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {countries.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelected(c.code)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              selected === c.code
                ? 'bg-red-600 text-white'
                : 'border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="space-y-5">
          <ProviderSection
            title="Stream"
            icon={<Monitor className="h-4 w-4 text-emerald-400" />}
            items={data?.flatrate || []}
            accent="bg-emerald-500/10 text-emerald-400"
            badgeText="Subscription"
          />
          <ProviderSection
            title="Free with Ads"
            icon={<Radio className="h-4 w-4 text-blue-400" />}
            items={[...(data?.ads || []), ...(data?.free || [])]}
            accent="bg-blue-500/10 text-blue-400"
            badgeText="Free"
          />
          <ProviderSection
            title="Rent"
            icon={<DollarSign className="h-4 w-4 text-yellow-400" />}
            items={data?.rent || []}
            accent="bg-yellow-500/10 text-yellow-400"
            badgeText="From $2.99"
          />
          <ProviderSection
            title="Buy"
            icon={<ShoppingCart className="h-4 w-4 text-orange-400" />}
            items={data?.buy || []}
            accent="bg-orange-500/10 text-orange-400"
            badgeText="Own it"
          />
        </div>

        <p className="mt-5 text-[10px] text-zinc-600">
          Streaming data provided by JustWatch via TMDB. Availability may vary.
        </p>
      </div>
    </div>
  );
}

function NoProviders() {
  return (
    <div className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-white sm:text-2xl">Where to Watch</h2>
      <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-6">
        <Tv className="h-8 w-8 text-zinc-700" />
        <div>
          <p className="text-sm font-medium text-zinc-400">Not available on streaming platforms</p>
          <p className="text-xs text-zinc-600">Check back later — availability changes frequently.</p>
        </div>
      </div>
    </div>
  );
}