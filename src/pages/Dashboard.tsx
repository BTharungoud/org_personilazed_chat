import axios from 'axios'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
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
import { appConfig } from '../config/appConfig'
import {
  chatService,
  clearAuthSession,
  extractList,
  extractMessage,
  extractModelText,
  getStoredDepartmentName,
  getStoredRoleName,
  getStoredUserEmail,
  getStoredUserId,
  getStoredUserName,
  referenceService,
  settingsService,
  updateStoredProfile,
} from '../services'
import type { ChatHistoryRecord, Department, SettingsRecord } from '../types/api'
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

const MODEL_OPTIONS = Array.from(
  new Set([appConfig.defaults.agentModel, 'auto', 'gemini', 'openai', 'claude']),
)

const toDate = (value: unknown) => {
  if (!value) return new Date()
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

const normalizeNestedHistoryMessages = (
  messages: Array<Record<string, unknown>>,
): ChatMessage[] =>
  messages.map((message, index) => {
    const senderValue = String(message.sender ?? message.role ?? '').toLowerCase()
    return {
      id: String(message.id ?? index),
      text: String(message.text ?? message.message ?? message.content ?? ''),
      sender:
        senderValue === 'bot' || senderValue === 'assistant' ? 'bot' : 'user',
      timestamp: toDate(message.timestamp ?? message.createdAt ?? message.updatedAt),
    }
  })

const normalizeHistoryMessages = (record: ChatHistoryRecord): ChatMessage[] => {
  if (record.messages?.length) {
    return normalizeNestedHistoryMessages(record.messages)
  }

  const messages: ChatMessage[] = []
  const recordId = String(record.id ?? 'history')
  const query = typeof record.query === 'string' ? record.query.trim() : ''
  const response = typeof record.response === 'string' ? record.response.trim() : ''

  if (query) {
    messages.push({
      id: `${recordId}-user`,
      text: query,
      sender: 'user',
      timestamp: toDate(record.createdAt ?? record.timestamp),
    })
  }
  if (response) {
    messages.push({
      id: `${recordId}-assistant`,
      text: response,
      sender: 'bot',
      timestamp: toDate(record.updatedAt ?? record.createdAt ?? record.timestamp),
    })
  }

  return messages
}

const normalizeChatSessions = (records: ChatHistoryRecord[]) => {
  if (records.length === 0) {
    return []
  }

  return records.map((record, index) => ({
    id: String(record.id ?? index + 1),
    title:
      String(record.title ?? record.subject ?? record.name ?? record.query ?? '').trim() ||
      `Conversation ${index + 1}`,
    timestamp: toDate(record.updatedAt ?? record.createdAt ?? record.timestamp),
    messages: normalizeHistoryMessages(record),
  }))
}

const buildFallbackBotMessage = (
  messageText: string,
  departments: string[],
  fileCount: number,
) => {
  const departmentLabel = departments.length > 0 ? departments.join(', ') : 'General'
  const fileLabel = fileCount > 0 ? ` Received ${fileCount} file(s) for ingestion.` : ''
  return `Thanks for your message about "${messageText}". I am processing it across ${departmentLabel}.${fileLabel}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [activeChatId, setActiveChatId] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [showDepartmentMenu, setShowDepartmentMenu] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState(appConfig.defaults.agentModel)
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [apiError, setApiError] = useState('')
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)
  const [profileName, setProfileName] = useState(getStoredUserName())
  const [profileEmail, setProfileEmail] = useState(getStoredUserEmail())
  const [profileDepartment, setProfileDepartment] = useState(getStoredDepartmentName())
  const [profileRole, setProfileRole] = useState(getStoredRoleName())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const departmentDropdownRef = useRef<HTMLDivElement>(null)
  const modelDropdownRef = useRef<HTMLDivElement>(null)
  const userId = getStoredUserId()
  const userName = profileName || getStoredUserName()
  const headerDepartment = profileDepartment || selectedDepartments[0] || 'Department not set'

  const activeSession = useMemo(
    () => chatSessions.find(session => session.id === activeChatId) ?? chatSessions[0],
    [activeChatId, chatSessions],
  )

  const messages = activeSession?.messages ?? []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const updateSessionMessages = (
    sessionId: string,
    updater: (current: ChatMessage[]) => ChatMessage[],
  ) => {
    setChatSessions(previousSessions =>
      previousSessions.some(session => session.id === sessionId)
        ? previousSessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: updater(session.messages),
                  timestamp: new Date(),
                }
              : session,
          )
        : [
            {
              id: sessionId,
              title: 'New Conversation',
              timestamp: new Date(),
              messages: updater([]),
            },
            ...previousSessions,
          ],
    )
  }

  const ensureActiveSession = () => {
    if (chatSessions.some(session => session.id === activeChatId)) {
      return activeChatId
    }

    const firstSession = chatSessions[0]
    if (firstSession) {
      setActiveChatId(firstSession.id)
      return firstSession.id
    }

    const newSessionId = Date.now().toString()
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      timestamp: new Date(),
      messages: [],
    }
    setChatSessions([newSession])
    setActiveChatId(newSessionId)
    return newSessionId
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    document.documentElement.dataset.theme = darkModeEnabled ? 'dark' : 'light'
  }, [darkModeEnabled])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        departmentDropdownRef.current &&
        !departmentDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDepartmentMenu(false)
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
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

  useEffect(() => {
    let isMounted = true

    Promise.allSettled([
      chatService.getHistoryByUser(userId),
      referenceService.listDepartments(),
      settingsService.getByUser(userId),
    ]).then(([historyResult, departmentsResult, settingsResult]) => {
      if (!isMounted) return

      if (historyResult.status === 'fulfilled') {
        const historyRecords = extractList<ChatHistoryRecord>(historyResult.value.data)
        const sessions = normalizeChatSessions(historyRecords)
        setChatSessions(sessions)
        setActiveChatId(sessions[0]?.id ?? '')
      }

      if (departmentsResult.status === 'fulfilled') {
        const departmentList = extractList<Department>(departmentsResult.value.data)
        if (departmentList.length > 0) {
          setDepartments(departmentList)
          const preferredDepartment =
            profileDepartment &&
            departmentList.some(
              department =>
                (department.name || `Department ${department.id}`) === profileDepartment,
            )
              ? profileDepartment
              : departmentList[0].name || `Department ${departmentList[0].id}`
          setSelectedDepartments([preferredDepartment])
        } else {
          setDepartments([])
          setSelectedDepartments([])
        }
      }

      if (settingsResult.status === 'fulfilled') {
        const settings = settingsResult.value.data as SettingsRecord
        if (typeof settings.darkMode === 'boolean') {
          setDarkModeEnabled(settings.darkMode)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [profileDepartment, userId])

  useEffect(() => {
    if (selectedDepartments.length === 0 && departments.length > 0) {
      const preferredDepartment =
        profileDepartment &&
        departments.some(
          department => (department.name || `Department ${department.id}`) === profileDepartment,
        )
          ? profileDepartment
          : departments[0].name || `Department ${departments[0].id}`
      setSelectedDepartments([preferredDepartment])
    }
  }, [departments, profileDepartment, selectedDepartments.length])

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(previousFiles => [...previousFiles, ...droppedFiles])
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(previousFiles => [...previousFiles, ...Array.from(e.target.files ?? [])])
    }
  }

  const removeFile = (index: number) => {
    setFiles(previousFiles => previousFiles.filter((_, currentIndex) => currentIndex !== index))
  }

  const toggleDepartment = (departmentName: string) => {
    setSelectedDepartments(previousDepartments =>
      previousDepartments.includes(departmentName)
        ? previousDepartments.filter(department => department !== departmentName)
        : [...previousDepartments, departmentName],
    )
  }

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      timestamp: new Date(),
      messages: [],
    }
    setChatSessions(previousSessions => [newChat, ...previousSessions])
    setActiveChatId(newChat.id)
    setApiError('')
  }

  const deleteChat = (id: string) => {
    setChatSessions(previousSessions => {
      const remaining = previousSessions.filter(chat => chat.id !== id)
      if (remaining.length === 0) {
        setActiveChatId('')
        return []
      }

      if (activeChatId === id) {
        setActiveChatId(remaining[0].id)
      }

      return remaining
    })
  }

  const handleLogout = () => {
    clearAuthSession()
    navigate('/login')
  }

  const handleSaveProfile = () => {
    const trimmedName = profileName.trim()
    const trimmedEmail = profileEmail.trim()
    const trimmedDepartment = profileDepartment.trim()
    const trimmedRole = profileRole.trim()

    updateStoredProfile({
      userName: trimmedName || userName,
      userEmail: trimmedEmail,
      departmentName: trimmedDepartment,
      roleName: trimmedRole,
    })

    if (trimmedName) {
      setProfileName(trimmedName)
    }

    if (trimmedEmail) {
      setProfileEmail(trimmedEmail)
    }

    setProfileDepartment(trimmedDepartment)
    setProfileRole(trimmedRole)

    if (trimmedDepartment) {
      if (trimmedDepartment) {
        setSelectedDepartments([trimmedDepartment])
      }
    }

    setShowProfilePanel(false)
  }

  const handleToggleDarkMode = async () => {
    const nextMode = !darkModeEnabled
    setDarkModeEnabled(nextMode)
    try {
      await settingsService.toggleDarkMode(userId)
    } catch (err) {
      setDarkModeEnabled(!nextMode)
      setApiError(
        axios.isAxiosError(err)
          ? extractMessage(err.response?.data ?? err.message, 'Failed to update settings.')
          : 'Failed to update settings.',
      )
    }
  }

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedMessage = inputValue.trim()
    if (!trimmedMessage && files.length === 0) return

    const sessionId = ensureActiveSession()
    const attachedFiles = [...files]
    const selectedDepartmentLabel = selectedDepartments.join(', ') || 'General'
    const userMessage: ChatMessage = {
      id: `${Date.now()}`,
      text: trimmedMessage || 'Uploaded files for review.',
      sender: 'user',
      timestamp: new Date(),
      files: attachedFiles.map(file => file.name),
    }

    setLoading(true)
    setApiError('')
    setInputValue('')
    setFiles([])

    updateSessionMessages(sessionId, currentMessages => {
      const nextMessages = [...currentMessages, userMessage]
      if (currentMessages.length === 0) {
        setChatSessions(previousSessions =>
          previousSessions.map(session =>
            session.id === sessionId
              ? { ...session, title: trimmedMessage.slice(0, 40) || 'New Conversation' }
              : session,
          ),
        )
      }
      return nextMessages
    })

    try {
      if (attachedFiles.length === 1) {
        await chatService.ingestFile(attachedFiles[0])
      } else if (attachedFiles.length > 1) {
        await chatService.ingestMultipleFiles(attachedFiles)
      }

      const generationResponse = await chatService.generate({
        userId,
        message: trimmedMessage || userMessage.text,
        agentSelected: selectedModel,
        category: selectedDepartmentLabel,
      })

      const replyText =
        extractModelText(generationResponse.data) ||
        extractMessage(generationResponse.data, '')

      const botMessage: ChatMessage = {
        id: `${Date.now() + 1}`,
        text:
          replyText ||
          buildFallbackBotMessage(userMessage.text, selectedDepartments, attachedFiles.length),
        sender: 'bot',
        timestamp: new Date(),
      }

      updateSessionMessages(sessionId, currentMessages => [...currentMessages, botMessage])
    } catch (err) {
      const fallback = buildFallbackBotMessage(
        userMessage.text,
        selectedDepartments,
        attachedFiles.length,
      )
      setApiError(
        axios.isAxiosError(err)
          ? extractMessage(err.response?.data ?? err.message, 'Unable to reach the backend.')
          : 'Unable to reach the backend.',
      )
      updateSessionMessages(sessionId, currentMessages => [
        ...currentMessages,
        {
          id: `${Date.now() + 1}`,
          text: fallback,
          sender: 'bot',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <Sparkles size={24} />
            <span>{appConfig.appName}</span>
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
          {chatSessions.length === 0 ? (
            <div className="empty-history">No chats yet. Start a new conversation.</div>
          ) : (
            chatSessions.map(session => (
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
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-btn" onClick={handleToggleDarkMode}>
            <Settings size={18} />
            <span>{darkModeEnabled ? 'Dark Mode: On' : 'Dark Mode: Off'}</span>
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

      <div className="main-content">
        <header className="dashboard-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          <div className="header-center">
            <div className="brand-center">
              <Sparkles size={28} />
              <span>{appConfig.appName}</span>
            </div>
          </div>

          <button
            type="button"
            className="header-profile profile-button"
            onClick={() => setShowProfilePanel(true)}
          >
            <div className="profile-info">
              <div className="avatar-circle">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-text">
                <div className="profile-name">{userName}</div>
                <div className="profile-email">
                  {headerDepartment}
                  {profileRole ? ` - ${profileRole}` : ''}
                </div>
              </div>
            </div>
          </button>
        </header>

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
                    {"What's the status of my order?"}
                  </div>
                  <div className="suggestion-item">
                    {'I need technical support'}
                  </div>
                  <div className="suggestion-item">
                    {'Can you review this document?'}
                  </div>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  {msg.files && msg.files.length > 0 && (
                    <div className="message-files">
                      {msg.files.map((file, index) => (
                        <div key={index} className="file-badge">
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

          <div className="input-area">
            <div className="department-selector">
              <div className="selector-label">Departments:</div>
              <div className="department-dropdown" ref={departmentDropdownRef}>
                <button
                  className="dropdown-button"
                  disabled={departments.length === 0}
                  onClick={() => setShowDepartmentMenu(!showDepartmentMenu)}
                >
                  <span>
                    {departments.length === 0
                      ? 'No departments'
                      : selectedDepartments.length === 1
                      ? selectedDepartments[0]
                      : `${selectedDepartments.length} selected`}
                  </span>
                  <ChevronDown size={18} />
                </button>

                {showDepartmentMenu && departments.length > 0 && (
                  <div className="dropdown-menu">
                    {departments.map(department => {
                      const departmentName = department.name || `Department ${department.id}`
                      return (
                        <label key={department.id} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(departmentName)}
                            onChange={() => toggleDepartment(departmentName)}
                          />
                          <span>{departmentName}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {files.length > 0 && (
              <div className="file-list-compact">
                {files.map((file, index) => (
                  <div key={index} className="file-badge-compact">
                    <span className="file-name-compact">
                      {file.name.length > 25 ? `${file.name.substring(0, 25)}...` : file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file-compact"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form className="message-input-form" onSubmit={handleSendMessage}>
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

              <input
                type="text"
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className="message-input"
              />

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
                    {MODEL_OPTIONS.map((model: string) => (
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

              <button
                type="submit"
                disabled={loading || (!inputValue.trim() && files.length === 0)}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </form>

            {apiError && <div className="catalog-message">{apiError}</div>}
          </div>
        </div>
      </div>

      {showProfilePanel && (
        <div className="profile-overlay" onClick={() => setShowProfilePanel(false)}>
          <div className="profile-panel" onClick={event => event.stopPropagation()}>
            <div className="profile-panel-header">
              <div>
                <h3>Edit Profile</h3>
                <p>Update the details used across the app.</p>
              </div>
              <button
                type="button"
                className="profile-close-btn"
                onClick={() => setShowProfilePanel(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="profile-field">
              <label htmlFor="profileName">Full name</label>
              <input
                id="profileName"
                type="text"
                value={profileName}
                onChange={event => setProfileName(event.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profileEmail">Email</label>
              <input
                id="profileEmail"
                type="email"
                value={profileEmail}
                onChange={event => setProfileEmail(event.target.value)}
              />
            </div>

            <div className="profile-field-grid">
              <div className="profile-field">
                <label htmlFor="profileDepartment">Department</label>
                <input
                  id="profileDepartment"
                  type="text"
                  value={profileDepartment}
                  onChange={event => setProfileDepartment(event.target.value)}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profileRole">Role</label>
                <input
                  id="profileRole"
                  type="text"
                  value={profileRole}
                  onChange={event => setProfileRole(event.target.value)}
                />
              </div>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-secondary-btn"
                onClick={() => setShowProfilePanel(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-primary-btn"
                onClick={handleSaveProfile}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
