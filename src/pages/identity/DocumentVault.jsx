import React from 'react';
import { FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DOCS = [
  { name: 'Passport', type: 'Government ID', uploaded: 'Jan 15, 2024', expires: 'Mar 22, 2029', status: 'verified', size: '2.4 MB' },
  { name: 'Utility Bill', type: 'Address Proof', uploaded: 'Jan 16, 2024', expires: 'N/A', status: 'verified', size: '1.1 MB' },
  { name: 'Bank Statement', type: 'Financial', uploaded: 'Jan 16, 2024', expires: 'N/A', status: 'verified', size: '3.8 MB' },
  { name: 'Articles of Incorporation', type: 'Corporate', uploaded: 'Jan 20, 2024', expires: 'N/A', status: 'verified', size: '5.2 MB' },
  { name: 'Tax Return 2023', type: 'Financial', uploaded: 'Feb 10, 2024', expires: 'N/A', status: 'pending', size: '4.0 MB' },
];

export default function DocumentVault() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Vault</h1>
          <p className="text-xs text-muted-foreground mt-1">Encrypted document storage — AES-256</p>
        </div>
        <Button variant="outline" size="sm">+ Upload Document</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['Document', 'Type', 'Uploaded', 'Expires', 'Size', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DOCS.map((d, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs font-medium">{d.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.type}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.uploaded}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{d.expires}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{d.size}</td>
                <td className="px-4 py-3">
                  {d.status === 'verified'
                    ? <span className="flex items-center gap-1 text-accent text-xs"><CheckCircle className="w-3 h-3" />Verified</span>
                    : <span className="flex items-center gap-1 text-yellow-500 text-xs"><AlertCircle className="w-3 h-3" />Pending</span>}
                </td>
                <td className="px-4 py-3">
                  <button className="text-muted-foreground hover:text-primary transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}