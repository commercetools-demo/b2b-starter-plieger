'use client';

interface FacetBucket {
  key: string;
  count: number;
}

interface Facet {
  name: string;
  buckets?: FacetBucket[];
  values?: FacetBucket[];
}

interface FacetSidebarProps {
  facets: Facet[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (facetName: string, value: string, checked: boolean) => void;
}

export function FacetSidebar({ facets, selectedFilters, onFilterChange }: FacetSidebarProps) {
  if (!facets || facets.length === 0) return null;

  return (
    <aside className="w-56 shrink-0 space-y-6">
      {facets.map((facet) => {
        const buckets = facet.buckets ?? facet.values ?? [];
        if (buckets.length === 0) return null;

        const selected = selectedFilters[facet.name] ?? [];

        return (
          <div key={facet.name}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 capitalize">
              {facet.name.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <ul className="space-y-1">
              {buckets.slice(0, 10).map((bucket) => (
                <li key={bucket.key}>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={selected.includes(bucket.key)}
                      onChange={(e) => onFilterChange(facet.name, bucket.key, e.target.checked)}
                      className="rounded border-gray-300 text-primary"
                    />
                    <span className="flex-1 truncate">{bucket.key}</span>
                    <span className="text-xs text-gray-400">{bucket.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </aside>
  );
}
