import React from "react";
import { Plus, Key, Search, Globe, Lock } from "lucide-react";

export default function Sidebar({
  rooms,
  activeRoomId,
  onRoomSelect,
  searchQuery,
  onSearchChange,
  onCreateRoomClick,
  onJoinRoomClick,
  joinedRoomIds,
}) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-r border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-950/40">
      
      {/* Fixed top buttons */}
      <div className="p-4 space-y-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
        <button
          onClick={onCreateRoomClick}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ember-accent text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-3 text-sm font-medium hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create room
        </button>

        <button
          onClick={onJoinRoomClick}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 px-4 py-3 text-sm font-medium border border-zinc-200/60 dark:border-zinc-800/60 transition-all"
        >
          <Key className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          Join room
        </button>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search rooms"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        </div>
      </div>

      {/* Scrollable Room List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 mt-4">
            <Globe className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
              No rooms found.<br />Create or join one!
            </p>
          </div>
        ) : (
          rooms.map((room) => {
            const isPrivate = room.visibility === "private";
            const isJoined = joinedRoomIds.includes(room.id);
            const isActive = activeRoomId === room.id;

            return (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {/* Room Avatar/Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-inner ${
                    isActive
                      ? "bg-white dark:bg-zinc-900"
                      : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  {isPrivate ? (
                    <Lock className={`h-5 w-5 ${isActive ? "text-amber-600" : "text-zinc-500"}`} />
                  ) : (
                    <Globe className="h-5 w-5 text-zinc-500" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-semibold text-sm leading-tight text-zinc-900 dark:text-zinc-100">
                      {room.name}
                    </span>
                    {room.lastMsgTime && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium shrink-0 ml-1">
                        {room.lastMsgTime}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {isPrivate && !isJoined
                      ? "Locked · join to read"
                      : room.lastMessage || (isPrivate ? "Locked · Tap to open" : "Start chatting...")}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
