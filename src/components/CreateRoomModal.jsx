import React, { useState } from "react";
import { X, Lock, Globe } from "lucide-react";

export default function CreateRoomModal({ isOpen, onClose, onCreate }) {
  const [roomName, setRoomName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    onCreate({
      name: roomName.trim(),
      visibility,
      password: visibility === "private" ? password : "",
    });
    setRoomName("");
    setVisibility("public");
    setPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-ember-cream p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Create a room</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Give it a name and choose who can walk in.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Room name</label>
            <input
              type="text"
              placeholder="e.g. Design Crew"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium border transition-all ${
                  visibility === "public"
                    ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 shadow-sm"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Globe className="h-4 w-4" />
                Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility("private")}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium border transition-all ${
                  visibility === "private"
                    ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 shadow-sm"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <Lock className="h-4 w-4" />
                Private
              </button>
            </div>
          </div>

          {/* Room Password (If Private) */}
          {visibility === "private" && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium mb-1.5">Room password</label>
              <input
                type="password"
                placeholder="Members will need this"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-2.5 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-ember-accent text-white dark:bg-zinc-100 dark:text-zinc-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all shadow-md"
            >
              Create room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
