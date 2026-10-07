import React, { useState, useEffect } from "react";
import { fetchApi } from "../../lib/api";
import { Laptop, Trash2 } from "lucide-react";

interface Session {
  id: number;
  expiresAt: string;
  isCurrent: boolean;
}

export function SecuritySettings() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoadingSessions(true);
      const res = await fetchApi("/auth/sessions");
      if (res.success && res.data.sessions) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirmation do not match.");
      setSaving(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetchApi("/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (res.success) {
        setSuccess("Password changed successfully.");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (id: number) => {
    try {
      const res = await fetchApi(`/auth/sessions/${id}`, {
        method: "DELETE",
      });
      if (res.success) {
        setSessions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err: any) {
      setError(err.message || "Failed to revoke session");
    }
  };

  return (
    <div className="space-y-8">
      {/* PASSWORD SETTINGS */}
      <div className="bg-white border border-[#DED9CF] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[#DED9CF] bg-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#171717]">Change Password</h3>
            <p className="mt-1 text-sm text-[#6B6862]">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="px-8 py-8 bg-[#FFFCF7] space-y-8">
          {error && (
            <div className="bg-[#8A3F3F]/10 border border-[#8A3F3F]/20 text-[#8A3F3F] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-6 max-w-lg">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-[#171717]">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-[#171717]">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
                required
                minLength={8}
              />
              <p className="mt-2 text-xs text-[#6B6862]">Must be at least 8 characters long.</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#171717]">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-2 block w-full rounded-xl border-[#DED9CF] px-4 py-2.5 shadow-sm focus:border-[#C7A64A] focus:ring-[#C7A64A] sm:text-sm bg-white text-[#171717]"
                required
                minLength={8}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#DED9CF] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center items-center rounded-xl border border-transparent bg-[#171717] py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#C7A64A] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {saving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>

      {/* SESSIONS */}
      <div className="bg-white border border-[#DED9CF] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[#DED9CF] bg-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#171717]">Active Sessions</h3>
            <p className="mt-1 text-sm text-[#6B6862]">
              Manage the devices where your account is currently signed in.
            </p>
          </div>
        </div>
        
        <div className="bg-[#FFFCF7] p-8">
          {loadingSessions ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-6 w-6 rounded-full border-2 border-[#C7A64A] border-t-transparent animate-spin"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#6B6862]">No active sessions found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#DED9CF] border border-[#DED9CF] rounded-xl overflow-hidden bg-white">
              {sessions.map(session => (
                <li key={session.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-[#F4F1EA] rounded-full flex items-center justify-center shrink-0">
                      <Laptop className="h-5 w-5 text-[#6B6862]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#171717]">
                        Active Session
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {session.isCurrent && (
                          <span className="inline-flex items-center rounded-full bg-[#3F6B4F]/10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#3F6B4F]">
                            Current
                          </span>
                        )}
                        <span className="text-xs text-[#6B6862]">
                          Expires {new Date(session.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-[#8A3F3F] hover:bg-[#8A3F3F]/10 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                      title="Revoke session"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Revoke</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
