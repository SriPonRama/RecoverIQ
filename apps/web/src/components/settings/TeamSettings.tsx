import { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Users, Shield, CheckCircle2, XCircle } from "lucide-react";

interface TeamMember {
  id: number;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

export function TeamSettings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    try {
      setLoading(true);
      const res = await fetchApi("/team");
      if (res.success && res.data.team) {
        setMembers(res.data.team);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-[#DED9CF] rounded-2xl p-12 flex justify-center items-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 rounded-full border-2 border-[#C7A64A] border-t-transparent animate-spin"></div>
          <p className="text-[#6B6862] text-sm">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DED9CF] rounded-2xl overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-[#DED9CF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#171717]">Team Members</h3>
          <p className="mt-1 text-sm text-[#6B6862]">
            Manage access and roles for your workspace team.
          </p>
        </div>
        <button
          disabled
          className="inline-flex justify-center items-center rounded-xl border border-[#DED9CF] bg-white py-2 px-4 text-sm font-semibold text-[#171717] shadow-sm opacity-50 cursor-not-allowed"
          title="Team invitations are not available yet"
        >
          Invite Member
        </button>
      </div>
      
      <div className="bg-[#FFFCF7]">
        {error && (
          <div className="p-8 pb-0">
            <div className="bg-[#8A3F3F]/10 border border-[#8A3F3F]/20 text-[#8A3F3F] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="h-16 w-16 bg-white border border-[#DED9CF] rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Users className="h-8 w-8 text-[#6B6862]" />
            </div>
            <h2 className="text-lg font-semibold text-[#111111] mb-2">No Team Members</h2>
            <p className="text-[#6B6862] max-w-sm mx-auto text-sm">
              You are the only member of this workspace.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-8">
            <table className="w-full text-left border-collapse border border-[#DED9CF] rounded-xl overflow-hidden bg-white shadow-sm">
              <thead className="bg-[#FFFCF7] border-b border-[#DED9CF]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-[#6B6862] uppercase tracking-wider w-[40%]">Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6B6862] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#6B6862] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DED9CF]">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#171717]">
                          {member.name || "Unnamed User"}
                        </span>
                        <span className="text-xs text-[#6B6862] mt-0.5">
                          {member.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-[#C7A64A]" />
                        <span className="text-sm font-medium text-[#171717]">
                          {member.role === "MERCHANT_USER" ? "Admin" : member.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {member.isActive ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-[#3F6B4F]" />
                            <span className="text-sm font-medium text-[#3F6B4F]">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-[#6B6862]" />
                            <span className="text-sm font-medium text-[#6B6862]">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
