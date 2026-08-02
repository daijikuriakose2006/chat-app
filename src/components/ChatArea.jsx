import React, { useState, useEffect, useRef } from "react";
import { Send, Smile, Lock, Key, Trash2, Edit3, X, Globe, EyeOff } from "lucide-react";
import { format } from "date-fns";

export default function ChatArea({
  room,
  currentUser,
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  isJoined,
  onUnlockRoom,
  typingUsers = [],
  setTyping,
}) {
  const [inputText, setInputText] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const popularEmojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
    "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
    "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯",
    "👎", "👍", "👊", "✊", "🤛", "🤜", "🤝", "🙌", "👏", "🙏",
    "🔥", "✨", "🎉", "❤️", "💖", "💡", "🎨", "🚀", "💻", "🍕"
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Handle typing status
  useEffect(() => {
    if (!room || !isJoined) return;
    if (inputText.trim()) {
      setTyping(true);
    } else {
      setTyping(false);
    }
    // Cleanup on unmount/room change
    return () => setTyping(false);
  }, [inputText, room, isJoined]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText("");
    setTyping(false);
  };

  const handleStartEdit = (msg) => {
    setEditingMessage(msg);
    setEditText(msg.text);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEditMessage(editingMessage.id, editText.trim());
    setEditingMessage(null);
    setEditText("");
  };

  const addEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    onUnlockRoom(room, passwordInput);
    setPasswordInput("");
  };

  // 1. Empty State
  if (!room) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-ember-light dark:bg-zinc-950 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 mb-6 shadow-inner animate-pulse">
          <Globe className="h-10 w-10 text-zinc-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">Welcome to Ember Chat</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Create a new room or join an existing public or private room to start real-time conversing.
        </p>
      </div>
    );
  }

  // 2. Locked State (Private Room & Not Joined)
  if (room.visibility === "private" && !isJoined) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-ember-light dark:bg-zinc-950 p-8 text-center">
        <div className="w-full max-w-md rounded-3xl bg-ember-cream p-8 shadow-xl dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20 mb-4 text-amber-600 dark:text-amber-500 shadow-sm border border-amber-200/40">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Room is Locked</h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            "{room.name}" is a private room. Please enter the room password to gain access and view messages.
          </p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                placeholder="Enter room password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 pl-10 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
              />
              <Key className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400" />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-ember-accent text-white dark:bg-zinc-100 dark:text-zinc-900 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-md"
            >
              Unlock Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Chat State (Public or Joined Private Room)
  return (
    <div className="flex flex-1 flex-col h-full bg-[#fcfaf6] dark:bg-zinc-950 animate-fade-in">
      
      {/* Chat Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 px-6 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
            {room.visibility === "private" ? (
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            ) : (
              <Globe className="h-5 w-5 text-zinc-500" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
              {room.name}
            </h2>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
              {room.visibility === "private" ? "Private Room" : "Public Room"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
              No messages yet in this room. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUser.uid;
            const timeStr = msg.createdAt
              ? format(msg.createdAt.toDate(), "hh:mm a")
              : "...";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${
                  isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Profile Pic */}
                <img
                  src={msg.senderPhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.senderId}`}
                  alt={msg.senderName}
                  className="h-8 w-8 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-100 shrink-0 self-end shadow-sm"
                />

                {/* Message Bubble Column */}
                <div className="flex flex-col space-y-1 min-w-0">
                  {!isOwn && (
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 px-1">
                      {msg.senderName}
                    </span>
                  )}
                  
                  {/* Bubble content */}
                  <div className="group relative">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${
                        isOwn
                          ? "bg-zinc-800 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-950 rounded-br-none"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-100 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      
                      {/* Msg actions (Edit/Delete) on hover */}
                      {isOwn && (
                        <div className="absolute top-1/2 -translate-y-1/2 -left-12 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-800 px-1.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm z-10">
                          <button
                            onClick={() => handleStartEdit(msg)}
                            className="rounded-full p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onDeleteMessage(msg.id)}
                            className="rounded-full p-1 text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div
                      className={`text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5 px-1 ${
                        isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      {timeStr}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 max-w-[80%] mr-auto animate-pulse">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"></span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic font-medium">
              {typingUsers.map((u) => u.displayName).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Edit Mode Header Overlay */}
      {editingMessage && (
        <div className="flex items-center justify-between px-6 py-2 bg-amber-50/80 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 text-xs font-medium animate-fade-in text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <Edit3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
            <span>Editing message...</span>
          </div>
          <button
            onClick={() => setEditingMessage(null)}
            className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="relative">
          <div className="absolute bottom-2 left-6 z-20 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500">Emojis</span>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-zinc-400 hover:text-zinc-600 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {popularEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => addEmoji(emoji)}
                  className="text-lg hover:scale-125 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded p-0.5 transition-all text-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input panel (Fixed bottom) */}
      <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950">
        <form
          onSubmit={editingMessage ? handleSaveEdit : handleSend}
          className="flex items-center gap-3 max-w-5xl mx-auto"
        >
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="rounded-full p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 hover:text-zinc-700"
          >
            <Smile className="h-5.5 w-5.5" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder={editingMessage ? "Save your edits..." : `Message ${room.name}`}
            value={editingMessage ? editText : inputText}
            onChange={(e) => (editingMessage ? setEditText(e.target.value) : setInputText(e.target.value))}
            className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
          />

          {/* Send/Submit Button */}
          <button
            type="submit"
            className="rounded-full bg-ember-accent text-white dark:bg-zinc-100 dark:text-zinc-900 p-3 hover:opacity-90 transition-all shadow-md shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
