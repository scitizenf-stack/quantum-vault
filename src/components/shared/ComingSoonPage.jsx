import React from 'react';
import { Construction } from 'lucide-react';

export default function ComingSoonPage({ title, description, icon: Icon }) {
  const IconComponent = Icon || Construction;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <IconComponent className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        {description || 'This section is under construction and will be available soon.'}
      </p>
      <div className="mt-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium tracking-wide uppercase">
        Coming Soon
      </div>
    </div>
  );
}