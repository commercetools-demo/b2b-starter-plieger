'use client';

import { useState, useEffect } from 'react';

const BUILD_TIME = new Date().toISOString();

export function Footer() {
  const [deployTime, setDeployTime] = useState('');

  useEffect(() => {
    setDeployTime(
      new Date(BUILD_TIME).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    );
  }, []);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Atlas Construction Equipment" className="h-6 w-auto" />
            <p className="text-sm text-slate-500">
              Atlas Construction Equipment &middot; Powered by commercetools &middot; {new Date().getFullYear()}
            </p>
          </div>
          {deployTime && (
            <p className="text-xs text-slate-400">
              Deployed: {deployTime}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
