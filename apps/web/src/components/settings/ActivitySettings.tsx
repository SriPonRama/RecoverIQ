import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { Badge } from "../ui/Badge";
import { Loader2, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLog {
  id: number;
  actorType: string;
  actorName: string | null;
  actorEmail: string | null;
  eventType: string;
  entityType: string;
  entityId: number | null;
  description: string | null;
  createdAt: string;
}

export function ActivitySettings() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs(page);
  }, [page]);

  async function loadLogs(pageToLoad: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchApi(`/api/activity?page=${pageToLoad}&limit=10`);
      setLogs(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }

  const getEventBadge = (eventType: string) => {
    if (eventType.includes("CREATED") || eventType.includes("LOGIN") || eventType.includes("CONNECTED")) {
      return <Badge variant="success" className="text-[10px]">{eventType}</Badge>;
    }
    if (eventType.includes("DELETED") || eventType.includes("FAILED") || eventType.includes("CANCELLED") || eventType.includes("REVOKED")) {
      return <Badge variant="error" className="text-[10px]">{eventType}</Badge>;
    }
    return <Badge variant="warning" className="text-[10px] bg-[#C7A64A] text-white border-transparent">{eventType}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#171717]">Audit & Activity</h2>
          <p className="text-sm text-[#6B6862] mt-1">
            Review security events, integrations, and critical business actions within your workspace.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#DED9CF] shadow-sm rounded-xl overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#FFFCF7]">
              <TableRow>
                <TableHead className="w-[180px] font-semibold text-[#171717]">Date & Time</TableHead>
                <TableHead className="font-semibold text-[#171717]">Event</TableHead>
                <TableHead className="font-semibold text-[#171717]">Description</TableHead>
                <TableHead className="font-semibold text-[#171717]">Actor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#DED9CF]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C7A64A] mx-auto mb-4" />
                    <p className="text-[#6B6862] font-medium">Loading activity logs...</p>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFFCF7] border border-[#DED9CF] mb-4">
                      <Inbox className="w-5 h-5 text-[#6B6862]" />
                    </div>
                    <p className="text-[#171717] font-semibold text-lg mb-1">No activity recorded yet</p>
                    <p className="text-[#6B6862]">Events will appear here as you interact with RecoverIQ.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-[#FFFCF7]/50 transition-colors">
                    <TableCell className="text-sm text-[#6B6862]">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getEventBadge(log.eventType)}
                    </TableCell>
                    <TableCell className="text-sm text-[#171717]">
                      {log.description || `${log.eventType} on ${log.entityType} ${log.entityId || ''}`}
                    </TableCell>
                    <TableCell className="text-sm text-[#6B6862]">
                      {log.actorType === 'USER' && log.actorName ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-[#171717]">{log.actorName}</span>
                          <span className="text-xs">{log.actorEmail}</span>
                        </div>
                      ) : (
                        <span className="font-medium">{log.actorType}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#DED9CF] bg-[#FFFCF7] flex items-center justify-between">
            <span className="text-sm text-[#6B6862] font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[#DED9CF] bg-white text-[#171717] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#DED9CF] bg-white text-[#171717] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
