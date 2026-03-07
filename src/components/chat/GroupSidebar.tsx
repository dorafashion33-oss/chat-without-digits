import { useState, useCallback } from "react";
import { Search, Plus, Users, ArrowLeft } from "lucide-react";
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
    setSelectedMembers((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-violet-500", "bg-indigo-500", "bg-fuchsia-500"];

  if (showCreate) {
    const filtered = searchQuery
      ? allUsers.filter((u) => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()))
      : allUsers;

    return (
      <div className="flex h-full flex-col bg-chat-sidebar animate-fade-in">
        <div className="flex items-center gap-2 border-b px-5 py-4 gradient-brand">
          <button onClick={() => setShowCreate(false)} className="rounded-full p-1 hover:bg-white/20"><ArrowLeft className="h-5 w-5 text-white" /></button>
          <h1 className="text-lg font-bold text-white">New Group</h1>
        </div>
        <div className="p-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="w-full rounded-xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground" autoFocus />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full rounded-xl bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="px-4">
          <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search members..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
        </div>
        {selectedMembers.length > 0 && (
          <p className="px-5 pt-2 text-xs text-primary font-medium">{selectedMembers.length} selected</p>
        )}
        <div className="flex-1 overflow-y-auto px-2 pt-2 scrollbar-thin">
          {filtered.map((user) => {
            const ci = user.username.charCodeAt(0) % colors.length;
            const selected = selectedMembers.includes(user.user_id);
            return (
              <button key={user.user_id} onClick={() => toggleMember(user.user_id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${selected ? "bg-primary/10" : "hover:bg-accent"}`}>
                {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors[ci]} text-xs font-semibold text-white`}>{(user.display_name || user.username)[0]?.toUpperCase()}</div>}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{user.display_name || user.username}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                  {selected && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t px-4 py-3">
          <button onClick={handleCreate} disabled={!name.trim()} className="w-full rounded-2xl gradient-brand py-3 text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90">
            Create Group
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-chat-sidebar pb-16 lg:pb-0 animate-fade-in">
      <div className="flex items-center justify-between gradient-brand px-5 py-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="rounded-full p-1 hover:bg-white/20 lg:hidden"><ArrowLeft className="h-5 w-5 text-white" /></button>
          <h1 className="text-lg font-bold text-white">Groups</h1>
        </div>
        <button onClick={handleStartCreate} className="rounded-full p-2 hover:bg-white/20">
          <Plus className="h-5 w-5 text-white" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">No groups yet</p>
            <button onClick={handleStartCreate} className="mt-3 rounded-full gradient-brand px-4 py-2 text-xs font-medium text-white hover:opacity-90">
              Create Group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <button key={group.id} onClick={() => onSelectGroup(group.id)} className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60 ${activeGroupId === group.id ? "bg-accent" : ""}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{group.name}</p>
                {group.description && <p className="text-xs text-muted-foreground truncate">{group.description}</p>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupSidebar;
