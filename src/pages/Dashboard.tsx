import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  LogOut,
  Plus,
  Send,
  Upload,
  Trash2,
  ChevronDown,
  MessageCircle,
  Settings,
  Bell,
  Sparkles,
  Paperclip,
} from 'lucide-react'
import './Dashboard.css'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  files?: string[]
}

interface ChatSession {
  id: string
  title: string
  timestamp: Date
  messages: ChatMessage[]
}

const DEPARTMENTS = [
  'Support',
  'Billing',
  'Technical',
  'Sales',
  'Product',
  'HR',
  'Legal',
  'Operations',
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Project Discussion',
      timestamp: new Date(Date.now() - 86400000),
      messages: [],
    },
    {
      id: '2',
      title: 'Q&A Session',
      timestamp: new Date(Date.now() - 172800000),
      messages: [],
    },
  ])
  const [activeChatId, setActiveChatId] = useState('1')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    'Support',
  ])
  const [showDepartmentMenu, setShowDepartmentMenu] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('auto')
  const [showModelMenu, setShowModelMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const departmentDropdownRef = useRef<HTMLDivElement>(null)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  const userName = localStorage.getItem('userName') || 'User'

  const MODEL_OPTIONS = ['auto', 'gemini', 'openai', 'claude']

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDepartmentMenu(false)
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModelMenu(false)
      }
    }

    if (showDepartmentMenu || showModelMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showDepartmentMenu, showModelMenu])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev =>
      prev.includes(dept)
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    )
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() && files.length === 0) return

    setLoading(true)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      files: files.map(f => f.name),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setFiles([])

    // Simulate bot response
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Thanks for your message about: "${inputValue}". I'm processing your query across the ${selectedDepartments.join(', ')} department(s). ${files.length > 0 ? `I've received ${files.length} file(s) for analysis.` : ''}`,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
      setLoading(false)
    }, 1500)
  }

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      timestamp: new Date(),
      messages: [],
    }
    setChatSessions(prev => [newChat, ...prev])
    setActiveChatId(newChat.id)
    setMessages([])
  }

  const deleteChat = (id: string) => {
    setChatSessions(prev => prev.filter(chat => chat.id !== id))
    if (activeChatId === id) {
      const remaining = chatSessions.filter(chat => chat.id !== id)
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <Sparkles size={24} />
            <span>PersonalChat</span>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <X size={20} />
          </button>
        </div>

        <button className="new-chat-btn" onClick={createNewChat}>
          <Plus size={18} />
          New Chat
        </button>

        <div className="chat-history">
          <div className="history-label">Chat History</div>
          {chatSessions.map(session => (
            <div
              key={session.id}
              className={`chat-item ${activeChatId === session.id ? 'active' : ''}`}
              onClick={() => setActiveChatId(session.id)}
            >
              <MessageCircle size={16} />
              <span className="chat-title">{session.title}</span>
              <button
                className="delete-chat-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteChat(session.id)
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-btn">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="sidebar-btn">
            <Bell size={18} />
            <span>Notifications</span>
          </button>
          <button className="sidebar-btn logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? true : <Menu size={24} />}
          </button>

          <div className="header-center">
            <div className="brand-center">
              <Sparkles size={28} />
              <span>PersonalChat</span>
            </div>
          </div>

          <div className="header-profile">
            <div className="profile-info">
              <div className="avatar-circle">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-text">
                <div className="profile-name">{userName}</div>
                <div className="profile-email">AI Assistant</div>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="chat-wrapper">
          <div
            className={`messages-container ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <Sparkles size={64} />
                </div>
                <h2>Start a Conversation</h2>
                <p>Select departments and ask your question</p>
                <div className="empty-suggestions">
                  <div className="suggestion-item">
                    "What's the status of my order?"
                  </div>
                  <div className="suggestion-item">
                    "I need technical support"
                  </div>
                  <div className="suggestion-item">
                    "Can you review this document?"
                  </div>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.sender}`}
              >
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  {msg.files && msg.files.length > 0 && (
                    <div className="message-files">
                      {msg.files.map((file, idx) => (
                        <div key={idx} className="file-badge">
                          <Upload size={12} />
                          {file}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            {/* Department Selector */}
            <div className="department-selector">
              <div className="selector-label">Departments:</div>
              <div className="department-dropdown" ref={departmentDropdownRef}>
                <button
                  className="dropdown-button"
                  onClick={() => setShowDepartmentMenu(!showDepartmentMenu)}
                >
                  <span>
                    {selectedDepartments.length === 1
                      ? selectedDepartments[0]
                      : `${selectedDepartments.length} selected`}
                  </span>
                  <ChevronDown size={18} />
                </button>

                {showDepartmentMenu && (
                  <div className="dropdown-menu">
                    {DEPARTMENTS.map(dept => (
                      <label key={dept} className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept)}
                          onChange={() => toggleDepartment(dept)}
                        />
                        <span>{dept}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* File List (if any files selected) */}
            {files.length > 0 && (
              <div className="file-list-compact">
                {files.map((file, idx) => (
                  <div key={idx} className="file-badge-compact">
                    <span className="file-name-compact">
                      {file.name.length > 25
                        ? file.name.substring(0, 25) + '...'
                        : file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="remove-file-compact"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Message Input Form with Model Selector and File Upload */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
              {/* File Upload Button */}
              <div
                className={`file-upload-compact ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <button
                  type="button"
                  className="file-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  title={`${files.length} file(s) selected`}
                >
                  <Paperclip size={18} />
                  {files.length > 0 && <span className="file-count">{files.length}</span>}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Message Input */}
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className="message-input"
              />

              {/* Model Selector Dropdown */}
              <div className="model-dropdown-compact" ref={modelDropdownRef}>
                <button
                  type="button"
                  className="model-button"
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  title="Select AI Model"
                >
                  <span className="model-label">{selectedModel}</span>
                  <ChevronDown size={16} />
                </button>

                {showModelMenu && (
                  <div className="model-menu">
                    {MODEL_OPTIONS.map(model => (
                      <button
                        key={model}
                        type="button"
                        className={`model-item ${selectedModel === model ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedModel(model)
                          setShowModelMenu(false)
                        }}
                      >
                        {model.charAt(0).toUpperCase() + model.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading || (!inputValue.trim() && files.length === 0)}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
