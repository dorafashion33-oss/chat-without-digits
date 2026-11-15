import { useState, useCallback } from "react";
import { Search, Plus, Users, ArrowLeft, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { DbProfile } from "@/hooks/useRealtimeMessages";
import type { Group } from "@/hooks/useGroups";

interface GroupSidebarProps {
  groups: Group[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (name: string, description: string, memberIds: string[]) => void;
  onBack: () => void;
}

const GroupSidebar = ({ groups, activeGroupId, onSelectGroup, onCreateGroup, onBack }: GroupSidebarProps) => {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [allUsers, setAllUsers] = useState<DbProfile[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("profiles").select("*");
    if (data && user) setAllUsers(data.filter((p) => p.user_id !== user.id));
  }, []);

  const handleStartCreate = () => {
    loadUsers();
    setShowCreate(true);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateGroup(name, description, selectedMembers);
    setShowCreate(false);
    setName("");
    setDescription("");
    setSelectedMembers([]);
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  if (showCreate) {
    const filtered = searchQuery
      ? allUsers.filter(
          (u) =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allUsers;

    return (
      <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-2 border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3.5 shadow-sm">
          <button
            onClick={() => setShowCreate(false)}
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-black text-[#0a0a0a]">Create New Group 👥</h1>
        </div>

        {/* Inputs */}
        <div className="p-4 space-y-2.5 bg-white border-b-2 border-[#0a0a0a]/15">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group Name (e.g. Buzz Founders)"
            className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3.5 py-2.5 text-xs font-bold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
            autoFocus
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description or purpose (optional)"
            className="w-full rounded-xl border-2 border-[#0a0a0a] bg-[#fffbec] px-3.5 py-2 text-xs font-semibold text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] outline-none placeholder:text-[#0a0a0a]/40"
          />
        </div>

        {/* Search Members */}
        <div className="p-3 border-b-2 border-[#0a0a0a]/15 bg-[#fffbec]">
          <div className="flex items-center gap-2 rounded-xl border-2 border-[#0a0a0a] bg-white px-3 py-2 shadow-[0_2px_0_0_#0a0a0a]">
            <Search className="h-4 w-4 text-[#0a0a0a]/60" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by username..."
              className="w-full bg-transparent text-xs font-semibold outline-none"
            />
          </div>
          {selectedMembers.length > 0 && (
            <p className="mt-2 text-[11px] font-black text-emerald-800">
              ✓ {selectedMembers.length} member{selectedMembers.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bz-grid-paper">
          {filtered.length === 0 ? (
            <p className="text-center text-xs font-bold text-[#5b5b55] py-8">No matching users</p>
          ) : (
            filtered.map((user) => {
              const selected = selectedMembers.includes(user.user_id);
              const initials = (user.display_name || user.username).slice(0, 2).toUpperCase();
              return (
                <div
                  key={user.user_id}
                  onClick={() => toggleMember(user.user_id)}
                  className={`bz-card p-2.5 flex items-center justify-between cursor-pointer transition-all ${
                    selected ? "bg-[#FFF6B8] border-2 border-[#0a0a0a]" : "hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-10 w-10 rounded-xl border-2 border-[#0a0a0a] object-cover shadow-[0_2px_0_0_#0a0a0a]"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0a0a0a] gradient-brand text-xs font-black text-white shadow-[0_2px_0_0_#0a0a0a]">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-black text-[#0a0a0a]">{user.display_name || user.username}</p>
                      <p className="text-[10px] font-mono text-[#5b5b55]">@{user.username}</p>
                    </div>
                  </div>
                  <div
                    className={`grid h-6 w-6 place-items-center rounded-lg border-2 border-[#0a0a0a] ${
                      selected ? "bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a]" : "bg-white"
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit */}
        <div className="border-t-2 border-[#0a0a0a] bg-white p-3">
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bz-btn bz-btn-yellow w-full py-3 text-xs font-black uppercase disabled:opacity-40"
          >
            Create Group ({selectedMembers.length + 1} People)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-r-2 border-[#0a0a0a] bg-[#fffbec] pb-16 lg:pb-0 animate-fade-in">
      {/* Neo-Brutalist Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0a0a0a] bg-[#FFF6B8] px-4 py-3.5 shadow-sm text-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-white text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] lg:hidden hover:bg-[#FCE314]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-lg font-black text-[#0a0a0a]">Buzz Groups 👥</h1>
        </div>
        <button
          onClick={handleStartCreate}
          className="grid h-8 w-8 place-items-center rounded-lg border-2 border-[#0a0a0a] bg-[#FCE314] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] hover:scale-105 transition-transform"
          title="Create New Group"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
        </button>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bz-grid-paper">
        {groups.length === 0 ? (
          <div className="bz-card max-w-xs mx-auto p-6 text-center my-10 shadow-[0_4px_0_0_#0a0a0a]">
            <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl border-2 border-[#0a0a0a] bg-[#E2ECFF] shadow-[0_2px_0_0_#0a0a0a] mb-3">
              <Users className="h-6 w-6 text-[#0a0a0a]" />
            </div>
            <p className="text-sm font-black text-[#0a0a0a]">No Groups Yet</p>
            <p className="text-xs text-[#5b5b55] mt-1 mb-4">
              Create a group to chat, share files, and place group calls with friends.
            </p>
            <button
              onClick={handleStartCreate}
              className="bz-btn bz-btn-yellow w-full py-2 text-xs font-black"
            >
              + Create First Group
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const isActive = activeGroupId === group.id;
            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`bz-card p-3 flex items-center gap-3 cursor-pointer transition-all ${
                  isActive ? "bg-[#FFF6B8] border-2 border-[#0a0a0a]" : "hover:bg-white"
                }`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0a0a0a] bg-[#E2ECFF] text-[#0a0a0a] shadow-[0_2px_0_0_#0a0a0a] flex-shrink-0 font-black">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#0a0a0a] truncate">{group.name}</p>
                  <p className="text-[11px] text-[#5b5b55] truncate font-medium">
                    {group.description || "Buzz Group Conversation"}
                  </p>
                </div>
                <span className="text-xs font-black text-[#0a0a0a]">›</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GroupSidebar;
