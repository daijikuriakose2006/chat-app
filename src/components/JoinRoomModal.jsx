import React, { useState } from "react";
import { X, Search, Lock, ShieldAlert } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";

export default function JoinRoomModal({ isOpen, onClose, onJoin }) {
  const [step, setStep] = useState(1); // 1 = Search Room Name, 2 = Enter Password for Private Room
  const [roomName, setRoomName] = useState("");
  const [foundRoom, setFoundRoom] = useState(null);
  const [password, setPassword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearchRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsSearching(true);
    try {
      const q = query(
        collection(db, "rooms"),
        where("name", "==", roomName.trim())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Room not found. Check the name and try again!");
        setIsSearching(false);
        return;
      }

      // Found the room
      const roomDoc = querySnapshot.docs[0];
      const roomData = { id: roomDoc.id, ...roomDoc.data() };
      setFoundRoom(roomData);

      if (roomData.visibility === "public") {
        // Public room: join immediately
        onJoin(roomData);
        handleClose();
      } else {
        // Private room: move to password step
        setStep(2);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === foundRoom.password) {
      onJoin(foundRoom);
      toast.success(`Joined room: ${foundRoom.name}`);
      handleClose();
    } else {
      toast.error("Incorrect room password!");
    }
  };

  const handleClose = () => {
    setStep(1);
    setRoomName("");
    setFoundRoom(null);
    setPassword("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-ember-cream p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Join a room</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {step === 1 ? "Enter the exact room name you want to join." : "This room is private and requires a password."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step 1: Search Room by Name */}
        {step === 1 && (
          <form onSubmit={handleSearchRoom} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Room name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Weekend Plans"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
                />
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-2xl px-5 py-2.5 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSearching}
                className="rounded-2xl bg-ember-accent text-white dark:bg-zinc-100 dark:text-zinc-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Join room"}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Password Prompt for Private Room */}
        {step === 2 && (
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 rounded-2xl border border-yellow-200/50 dark:border-yellow-900/30">
              <Lock className="h-5 w-5 shrink-0" />
              <div className="text-xs font-medium">
                "{foundRoom?.name}" is a private room.
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Enter password</label>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-2xl px-5 py-2.5 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-ember-accent text-white dark:bg-zinc-100 dark:text-zinc-900 px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all shadow-md"
              >
                Verify & Enter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
