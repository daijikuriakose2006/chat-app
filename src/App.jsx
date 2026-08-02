import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import CreateRoomModal from "./components/CreateRoomModal";
import JoinRoomModal from "./components/JoinRoomModal";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase/config";
import { Sun, Moon, LogOut, MessageSquare, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { currentUser, isFirebaseConfigured } = useAuth();

  if (!isFirebaseConfigured) {
    return <Navigate to="/config-error" />;
  }

  return currentUser ? children : <Navigate to="/auth" />;
}

// Configuration Error Page
function ConfigErrorPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#fdfbf7] p-6 text-zinc-800">
      <div className="w-full max-w-md rounded-3xl bg-[#f5f0e6] p-8 shadow-xl text-center border border-zinc-200/50">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-4" />
        <h2 className="text-xl font-bold">Firebase Configuration Missing</h2>
        <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
          Please set up your Firebase project and add your credentials in a <strong>.env</strong> file at the root of the project:
        </p>
        <pre className="mt-4 p-4 text-left text-xs bg-white rounded-2xl border border-zinc-200 overflow-x-auto select-all">
{`VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}
        </pre>
        <p className="mt-4 text-xs text-zinc-500">
          Refer to <code>.env.example</code> for details. Restart your local server once configured.
        </p>
      </div>
    </div>
  );
}

// Auth component (Login / Register Page)
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success("Successfully logged in!");
      } else {
        await signup(email, password, displayName);
        toast.success("Account created successfully!");
      }
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      toast.success("Signed in with Google!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Google Sign-In failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] dark:bg-zinc-950 px-4 transition-colors duration-200 relative">
      
      {/* Top Left Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-6 left-6 rounded-full p-2.5 bg-[#f5f0e6] dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:scale-105 transition-all shadow-sm cursor-pointer z-10"
        title="Toggle theme"
      >
        {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-md rounded-[32px] bg-[#f5f0e6] dark:bg-zinc-900/60 p-8 shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-800 dark:text-zinc-100 relative">
        
        {/* Chat Icon Header */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 dark:bg-zinc-100 text-[#fdfbf7] dark:text-zinc-900 mb-4 shadow-md">
          <MessageSquare className="h-6 w-6" />
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight">Ember Chat</h2>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-8">
          Real-time rooms, public and private.
        </p>

        {/* Tabs toggle */}
        <div className="flex p-1 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              isLogin
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              !isLogin
                ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            Register
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-500 dark:text-zinc-400">
                Display name
              </label>
              <input
                type="text"
                placeholder="Ada Lovelace"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-zinc-500 dark:text-zinc-400">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-zinc-500 dark:text-zinc-400">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-zinc-800 text-[#fdfbf7] dark:bg-zinc-100 dark:text-zinc-950 py-3 text-sm font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? "Please wait..." : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-800"></div>
          </div>
          <span className="relative bg-[#f5f0e6] dark:bg-zinc-900/60 px-3 text-xs text-zinc-400">or</span>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-3 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

// Dashboard Page
function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Modal Open states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Rooms and active room states
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Local storage cache for joined private room IDs
  const [joinedRoomIds, setJoinedRoomIds] = useState(() => {
    try {
      const cached = localStorage.getItem(`joined_rooms_${currentUser?.uid}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Save joined rooms array to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`joined_rooms_${currentUser.uid}`, JSON.stringify(joinedRoomIds));
    }
  }, [joinedRoomIds, currentUser]);

  // Dark/Light Theme Side Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Load Rooms list in real-time
  useEffect(() => {
    const roomsQuery = query(collection(db, "rooms"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
      const roomsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomsList);
    });
    return unsubscribe;
  }, []);

  // Listen for Messages when Active Room changes
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, `rooms/${activeRoom.id}/messages`),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgList);
    });
    return unsubscribe;
  }, [activeRoom]);

  // Listen for Typing Users in Active Room
  useEffect(() => {
    if (!activeRoom) {
      setTypingUsers([]);
      return;
    }

    const typingRef = collection(db, `rooms/${activeRoom.id}/typing`);
    const unsubscribe = onSnapshot(typingRef, (snapshot) => {
      const users = snapshot.docs
        .map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))
        .filter((u) => u.uid !== currentUser.uid); // Exclude self
      setTypingUsers(users);
    });
    return unsubscribe;
  }, [activeRoom, currentUser.uid]);

  // Set Typing Status helper
  const setTyping = async (isTyping) => {
    if (!activeRoom) return;
    const typingDocRef = doc(db, `rooms/${activeRoom.id}/typing`, currentUser.uid);
    try {
      if (isTyping) {
        await setDoc(typingDocRef, {
          displayName: currentUser.displayName,
          typedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(typingDocRef);
      }
    } catch (e) {
      console.error("Error setting typing status:", e);
    }
  };

  const handleCreateRoom = async (roomData) => {
    try {
      // Check if room name already exists
      const existing = rooms.find((r) => r.name.toLowerCase() === roomData.name.toLowerCase());
      if (existing) {
        toast.error("A room with that name already exists!");
        return;
      }

      const docRef = await addDoc(collection(db, "rooms"), {
        ...roomData,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Room created",
        lastMsgTime: "",
      });

      // Auto join
      const newRoom = { id: docRef.id, ...roomData };
      if (roomData.visibility === "private") {
        setJoinedRoomIds((prev) => [...prev, docRef.id]);
      }
      setActiveRoom(newRoom);
      toast.success(`Room "${roomData.name}" created!`);
    } catch (e) {
      console.error("Error creating room:", e);
      toast.error("Failed to create room.");
    }
  };

  const handleJoinRoom = (room) => {
    if (room.visibility === "private") {
      setJoinedRoomIds((prev) => {
        if (!prev.includes(room.id)) {
          return [...prev, room.id];
        }
        return prev;
      });
    }
    setActiveRoom(room);
  };

  const handleUnlockRoom = (room, passwordInput) => {
    if (room.password === passwordInput) {
      setJoinedRoomIds((prev) => [...prev, room.id]);
      toast.success(`Joined room: ${room.name}`);
    } else {
      toast.error("Incorrect room password!");
    }
  };

  const handleSendMessage = async (text) => {
    if (!activeRoom) return;
    try {
      await addDoc(collection(db, `rooms/${activeRoom.id}/messages`), {
        text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || "User",
        senderPhoto: currentUser.photoURL || "",
        createdAt: serverTimestamp(),
      });

      // Update room last message info
      const roomRef = doc(db, "rooms", activeRoom.id);
      await updateDoc(roomRef, {
        lastMessage: text,
        lastMsgTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (e) {
      console.error("Error sending message:", e);
      toast.error("Message could not be sent.");
    }
  };

  const handleEditMessage = async (msgId, newText) => {
    if (!activeRoom) return;
    try {
      const msgRef = doc(db, `rooms/${activeRoom.id}/messages`, msgId);
      await updateDoc(msgRef, {
        text: newText,
        isEdited: true,
      });
      toast.success("Message edited");
    } catch (e) {
      console.error(e);
      toast.error("Failed to edit message");
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!activeRoom) return;
    try {
      const msgRef = doc(db, `rooms/${activeRoom.id}/messages`, msgId);
      await deleteDoc(msgRef);
      toast.success("Message deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete message");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (e) {
      console.error(e);
      toast.error("Logout failed");
    }
  };

  // Filter room list by search query
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if room is joined
  const isJoined = (room) => {
    if (room.visibility === "public") return true;
    return joinedRoomIds.includes(room.id);
  };

  return (
    <div className="flex h-screen flex-col bg-[#fdfbf7] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 px-6 backdrop-blur-sm shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">Ember Chat</h1>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold leading-none">
              Real-time rooms
            </p>
          </div>
        </div>

        {/* Profile info, theme toggle, and logout */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 transition-all hover:scale-105"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
          </button>

          {currentUser && (
            <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-4">
              <div className="relative">
                <img
                  src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
                  alt={currentUser.displayName}
                  className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500"></span>
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {currentUser.displayName || "You"}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="rounded-full p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main chat panel (Directly below navbar) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          rooms={filteredRooms}
          activeRoomId={activeRoom?.id}
          onRoomSelect={setActiveRoom}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateRoomClick={() => setIsCreateOpen(true)}
          onJoinRoomClick={() => setIsJoinOpen(true)}
          joinedRoomIds={joinedRoomIds}
        />

        {/* Chat Area */}
        <ChatArea
          room={activeRoom}
          currentUser={currentUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          isJoined={activeRoom ? isJoined(activeRoom) : false}
          onUnlockRoom={handleUnlockRoom}
          typingUsers={typingUsers}
          setTyping={setTyping}
        />
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRoom}
      />

      <JoinRoomModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoin={handleJoinRoom}
      />
    </div>
  );
}

// Main App Router Setup
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/config-error" element={<ConfigErrorPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster position="top-center" reverseOrder={false} />
    </AuthProvider>
  );
}
