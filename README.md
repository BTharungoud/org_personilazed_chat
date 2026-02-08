# PersonalChat - AI Conversation Platform

A modern, feature-rich React UI application for AI-powered conversations with multi-department support, file uploads, and chat history management.

## Features

✨ **Authentication System**
- Modern login page with email and password authentication
- Registration page with form validation
- Token-based authentication

💬 **Chat Interface**
- Real-time chat with AI responses
- Chat history management in left sidebar
- Create and delete chat sessions
- Typing indicators for bot responses

🏢 **Multi-Department Support**
- Select multiple departments for your queries
- Dropdown selector with checkbox options
- Per-message department selection

📁 **File Upload**
- Drag-and-drop file upload support
- Click to browse and upload files
- Display uploaded files in messages
- Remove individual files before sending

👤 **User Profile**
- Profile display in top-right corner
- User information in header
- Profile avatar with initials

🎨 **Modern Design**
- Dark theme with gradient accents
- Responsive layout for all devices
- Smooth animations and transitions
- Glass-morphism effects

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Lucide React** - Icons
- **CSS3** - Styling with animations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Navigate to the project:
```bash
cd org_personilazed_chat
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to:
```
http://localhost:5173
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.tsx
│   ├── LoginPage.css
│   ├── RegisterPage.tsx
│   ├── RegisterPage.css
│   ├── Dashboard.tsx
│   └── Dashboard.css
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

## Key Features

### Authentication
- Login with email/password
- User registration with validation
- Protected routes
- Token-based session management

### Dashboard
- Left sidebar with chat history
- Top header with user profile
- Main chat area with messages
- Department selector dropdown
- File upload with drag-and-drop

### Chat
- Real-time message sending
- AI responses with typing indicators
- File attachment support
- Chat history management
- Create/delete conversations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)