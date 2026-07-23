import React from 'react';
import { ShieldOff } from 'lucide-react';

export default function AccessDenied({ section }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <ShieldOff className="w-12 h-12 text-muted-foreground" />
      <div>
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-sm text-muted-foreground mt-1">
          You don't have permission to view {section ? `the ${section} section` : 'this page'}.
          Contact your administrator to request access.
        </p>
      </div>
    </div>
  );
}