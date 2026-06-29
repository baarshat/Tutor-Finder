import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, MessageSquare, Users, Send, ArrowLeft } from "lucide-react";
import "./MessagingPage.css";

const API_BASE = "http://localhost:8080";

// Helper to parse a STOMP frame
const parseStompFrame = (data) => {
  data = data.replace(/\r\n/g, "\n");
  const nullIdx = data.indexOf("\u0000");
  if (nullIdx !== -1) {
    data = data.slice(0, nullIdx);
  }
  const parts = data.split("\n\n");
  if (parts.length < 2) return null;
  const headerLines = parts[0].split("\n");
  const command = headerLines[0].trim();
  const headers = {};
  for (let i = 1; i < headerLines.length; i++) {
    const line = headerLines[i];
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }
  const body = parts.slice(1).join("\n\n").trim();
  return { command, headers, body };
};

// Helper to format a STOMP frame
const formatStompFrame = (command, headers, body = "") => {
  let frame = command + "\n";
  for (const [key, val] of Object.entries(headers)) {
    frame += `${key}:${val}\n`;
  }
  frame += "\n" + body + "\u0000";
  return frame;
};

const MessagingPage = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const currentUserId = user?.userId || user?.id;
  const userName = user?.name || user?.fullName || "User";
  const token = user?.token || user?.accessToken || user?.jwtToken || localStorage.getItem("token") || "";

  const [activeTab, setActiveTab] = useState("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // { userId, userName, profilePicUrl }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [allTutors, setAllTutors] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  const [stompConnected, setStompConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);

  // Sync selected chat to ref for the WebSocket listener to avoid closures/reconnection
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // WebSocket connection & subscription setup
  useEffect(() => {
    if (!currentUserId || !token) return;

    const wsUrl = "ws://localhost:8080/ws";
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected. Sending STOMP CONNECT...");
      const connectFrame = formatStompFrame("CONNECT", {
        "accept-version": "1.1,1.2",
        "Authorization": `Bearer ${token}`
      });
      ws.send(connectFrame);
    };

    ws.onmessage = (event) => {
      const frame = parseStompFrame(event.data);
      if (!frame) return;

      if (frame.command === "CONNECTED") {
        console.log("STOMP connection established");
        setStompConnected(true);
        // Subscribe to user messages queue
        const subFrame = formatStompFrame("SUBSCRIBE", {
          id: "sub-private-messages",
          destination: "/user/queue/messages"
        });
        ws.send(subFrame);
      } else if (frame.command === "MESSAGE") {
        try {
          const message = JSON.parse(frame.body);
          console.log("WebSocket message received:", message);

          // Append message if it belongs to currently selected chat session
          const activeChatId = selectedChatRef.current?.userId;
          const isFromOrToActiveChat =
            message.senderId === activeChatId || message.recipientId === activeChatId;

          if (isFromOrToActiveChat) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) return prev;
              
              // Filter out temporary optimistic message if any
              const filtered = prev.filter(
                (m) =>
                  !(
                    m.id &&
                    m.id.toString().startsWith("temp-") &&
                    m.content === message.content &&
                    m.senderId === message.senderId
                  )
              );
              return [...filtered, message];
            });
          }

          // Update last message in conversation list
          setConversations((prev) => {
            const partnerId = message.senderId === currentUserId ? message.recipientId : message.senderId;
            const hasConv = prev.some((c) => c.userId === partnerId);
            
            let updatedList = [];
            if (hasConv) {
              updatedList = prev.map((conv) => {
                if (conv.userId === partnerId) {
                  return {
                    ...conv,
                    lastMessage: message.content,
                    lastMessageTime: message.timestamp || new Date().toISOString()
                  };
                }
                return conv;
              });
            } else {
              // If new conversation partner, reload conversations
              setTimeout(() => {
                loadConversations();
              }, 500);
              return prev;
            }

            return updatedList.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
          });
        } catch (e) {
          console.error("Failed to parse WebSocket message frame:", e);
        }
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket connection error:", err);
      setStompConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setStompConnected(false);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [currentUserId, token]);

  // Load all tutors once for search
  useEffect(() => {
    const loadTutors = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tutors`, {
          credentials: "include",
          headers: authHeaders,
        });
        if (res.ok) {
          const data = await res.json();
          setAllTutors(
            (Array.isArray(data) ? data : [])
              .filter((t) => (t.status || "").toUpperCase() === "VERIFIED")
          );
        }
      } catch (err) {
        console.error("Failed to load tutors", err);
      }
    };
    loadTutors();
  }, []);

  // Load all students once for search
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/students`, {
          credentials: "include",
          headers: authHeaders,
        });
        if (res.ok) {
          const data = await res.json();
          setAllStudents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load students", err);
      }
    };
    loadStudents();
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat/conversations/${currentUserId}`, {
        credentials: "include",
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Search tutors and students based on user role
  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const query = searchQuery.toLowerCase();
    const loggedInRole = (user?.role || "").toUpperCase();

    let combined = [];
    if (loggedInRole === "STUDENT") {
      // Students can only search for Tutors
      combined = allTutors.map((t) => ({ ...t, chatRole: "TUTOR" }));
    } else if (loggedInRole === "TUTOR") {
      // Tutors can only search for Students
      combined = allStudents.map((s) => ({ ...s, chatRole: "STUDENT" }));
    } else {
      // Admins and other roles can search both
      const tutorsList = allTutors.map((t) => ({ ...t, chatRole: "TUTOR" }));
      const studentsList = allStudents.map((s) => ({ ...s, chatRole: "STUDENT" }));
      combined = [...tutorsList, ...studentsList];
    }

    const results = combined.filter(
      (u) =>
        (u.userName || u.name || "").toLowerCase().includes(query) ||
        (u.subjects || u.preferredSubjects || "").toString().toLowerCase().includes(query) ||
        (u.userEmail || "").toLowerCase().includes(query)
    );
    setSearchResults(results.slice(0, 8));
    setShowSearchDropdown(true);
  }, [searchQuery, allTutors, allStudents, user]);

  // Load chat history when selecting a chat
  const loadChatHistory = useCallback(
    async (otherUserId) => {
      if (!currentUserId || !otherUserId) return;
      setLoadingChat(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/chat/history/${currentUserId}/${otherUserId}?page=0&size=100`,
          { credentials: "include", headers: authHeaders }
        );
        if (res.ok) {
          const data = await res.json();
          // API returns newest first, reverse for display
          const chatMessages = (data.content || []).reverse();
          setMessages(chatMessages);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setLoadingChat(false);
      }
    },
    [currentUserId]
  );

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start chat with a searched tutor
  const handleSelectTutor = (tutor) => {
    const tutorUserId = tutor.userId || tutor.id;
    const selected = {
      userId: tutorUserId,
      userName: tutor.userName || tutor.name || "Tutor",
      profilePicUrl: tutor.profilePicUrl || null,
    };
    setSelectedChat(selected);
    setSearchQuery("");
    setShowSearchDropdown(false);
    loadChatHistory(tutorUserId);
  };

  // Select a conversation from sidebar
  const handleSelectConversation = (conv) => {
    const selected = {
      userId: conv.userId,
      userName: conv.userName,
      profilePicUrl: conv.profilePicUrl,
    };
    setSelectedChat(selected);
    loadChatHistory(conv.userId);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUserId) return;
    const messageDTO = {
      senderId: currentUserId,
      recipientId: selectedChat.userId,
      content: newMessage.trim(),
    };

    // Optimistic update
    const optimistic = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      recipientId: selectedChat.userId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage("");

    // Use WebSocket if connected
    if (socketRef.current && stompConnected) {
      try {
        const sendFrame = formatStompFrame("SEND", {
          destination: "/app/chat.send",
          "content-type": "application/json"
        }, JSON.stringify(messageDTO));
        
        socketRef.current.send(sendFrame);
        
        // Refresh conversations list shortly after sending to update the side panel
        setTimeout(() => {
          loadConversations();
        }, 300);
      } catch (err) {
        console.error("Failed to send message via WebSocket, falling back to HTTP", err);
        fallbackSendHttpMessage(messageDTO);
      }
    } else {
      console.log("WebSocket not open or STOMP not connected, using HTTP fallback");
      fallbackSendHttpMessage(messageDTO);
    }
  };

  const fallbackSendHttpMessage = async (messageDTO) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/send`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders,
        body: JSON.stringify(messageDTO),
      });
      if (res.ok) {
        loadConversations();
      }
    } catch (err) {
      console.error("Failed to send message via HTTP", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div className="messaging-container">
      {/* Sidebar */}
      <div className={`messaging-sidebar ${selectedChat ? "hide-on-mobile" : ""}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar-placeholder">{getInitial(userName)}</div>
            <span className="user-name">{userName}</span>
          </div>
        </div>

        <div className="sidebar-search">
          <div className="search-input-wrapper" ref={searchInputRef}>
            <Search size={18} className="search-icon" />
            <input
              id="tutor-search-input"
              type="text"
              placeholder={
                (user?.role || "").toUpperCase() === "STUDENT"
                  ? "Search tutors..."
                  : (user?.role || "").toUpperCase() === "TUTOR"
                  ? "Search students..."
                  : "Search tutors and students..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            />
          </div>
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="search-dropdown" id="search-dropdown">
              {searchResults.map((contact) => (
                <div
                  key={contact.userId}
                  className="search-result-item"
                  onMouseDown={() => handleSelectTutor(contact)}
                >
                  <div className="search-result-avatar">
                    {contact.profilePicUrl ? (
                      <img
                        src={`data:image/jpeg;base64,${contact.profilePicUrl}`}
                        alt={contact.userName || contact.name}
                      />
                    ) : (
                      <div className="avatar-placeholder small">
                        {getInitial(contact.userName || contact.name)}
                      </div>
                    )}
                  </div>
                  <div className="search-result-info">
                    <span className="search-result-name">
                      {contact.userName || contact.name}
                    </span>
                    <span className="search-result-subject">
                      {contact.chatRole === "TUTOR" ? (
                        <>Tutor &bull; {Array.isArray(contact.subjects) ? contact.subjects.join(", ") : contact.subjects || ""}</>
                      ) : (
                        <>Student &bull; {contact.preferredSubjects || contact.currentClass || "Student"}</>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showSearchDropdown && searchQuery.trim() && searchResults.length === 0 && (
            <div className="search-dropdown">
              <div className="search-no-results">No tutors or students found</div>
            </div>
          )}
        </div>

        <div className="sidebar-tabs">
          <button
            className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            <MessageSquare size={20} />
          </button>
          <button
            className={`tab-btn ${activeTab === "contacts" ? "active" : ""}`}
            onClick={() => setActiveTab("contacts")}
          >
            <Users size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          {activeTab === "messages" && (
            <>
              {conversations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon-wrapper">
                    <MessageSquare size={48} className="empty-icon" />
                  </div>
                  <p>No conversations yet</p>
                  <p className="empty-hint">Search for a tutor or student to start chatting</p>
                </div>
              ) : (
                <div className="conversation-list">
                  {conversations.map((conv) => (
                    <div
                      key={conv.userId}
                      className={`conversation-item ${
                        selectedChat?.userId === conv.userId ? "active" : ""
                      }`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <div className="conversation-avatar">
                        {conv.profilePicUrl ? (
                          <img
                            src={`data:image/jpeg;base64,${conv.profilePicUrl}`}
                            alt={conv.userName}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {getInitial(conv.userName)}
                          </div>
                        )}
                      </div>
                      <div className="conversation-info">
                        <div className="conversation-top">
                          <span className="conversation-name">{conv.userName}</span>
                          <span className="conversation-time">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="conversation-last-msg">
                          {conv.lastMessage
                            ? conv.lastMessage.length > 35
                              ? conv.lastMessage.slice(0, 35) + "..."
                              : conv.lastMessage
                            : "Start a conversation"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`messaging-main ${!selectedChat ? "no-chat" : ""} ${selectedChat ? "show-on-mobile" : ""}`}>
        {!selectedChat ? (
          <div className="welcome-screen">
            <div className="welcome-avatar-wrapper">
              <div className="welcome-avatar">{getInitial(userName)}</div>
              <div className="status-dot"></div>
            </div>
            <h2 className="welcome-title">Welcome, {userName.split(" ")[0]}</h2>
            <p className="welcome-subtitle">
              Start a conversation and connect with others. Share ideas, ask
              questions, or simply say hello.
            </p>
          </div>
        ) : (
          <div className="chat-interface">
            {/* Chat Header */}
            <div className="chat-header">
              <button
                className="back-btn mobile-only"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft size={20} />
              </button>
              <div className="chat-header-avatar">
                {selectedChat.profilePicUrl ? (
                  <img
                    src={`data:image/jpeg;base64,${selectedChat.profilePicUrl}`}
                    alt={selectedChat.userName}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitial(selectedChat.userName)}
                  </div>
                )}
              </div>
              <div className="chat-header-info">
                <span className="chat-header-name">{selectedChat.userName}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {loadingChat ? (
                <div className="chat-loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  <p>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={msg.id || idx}
                    className={`message-bubble ${
                      msg.senderId === currentUserId ? "sent" : "received"
                    }`}
                  >
                    <div className="bubble-content">
                      <p>{msg.content}</p>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="chat-input-area">
              <input
                id="message-input"
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                id="send-message-btn"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
