import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './App.css';

const App = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const isFirstMessage = useRef(true);
  const [status, setStatus] = useState("Connecting...");
  const [currentVersion, setCurrentVersion] = useState(0); 
  const [showShareInput, setShowShareInput] = useState(false); // Controls the email input box
  const [emailInput, setEmailInput] = useState(""); // Stores comma-separated emails
  
  const userEmail = sessionStorage.getItem('user_email') || '';

  useEffect(() => {
    if (!userEmail || !docId) {
      navigate('/');
      return;
    }

    const socket = new WebSocket(`ws://127.0.0.1:8000/ws/${docId}?user_email=${encodeURIComponent(userEmail)}`);
    socket.binaryType = "arraybuffer";
    socketRef.current = socket;

    socket.onopen = () => setStatus("Connected");
    socket.onclose = () => setStatus("Disconnected");

    socket.onmessage = async (event) => {
      const buffer = new Uint8Array(event.data);
      const jsonStartIndex = buffer.indexOf(123); 
      if (jsonStartIndex === -1) return;

      const data = buffer.slice(jsonStartIndex);
      const payloadString = new TextDecoder().decode(data);

      try {
        const payload = JSON.parse(payloadString);
        const editor = quillRef.current.getEditor();

        if (isFirstMessage.current) {
          editor.setContents(payload.content, 'silent');
          setCurrentVersion(payload.version); 
          isFirstMessage.current = false;
        } else {
          if (payload.ops) {
            editor.updateContents(payload, 'silent');
          }
        }
      } catch (e) {
        console.error("Payload Sync Error:", e);
      }
    };

    return () => socket.close();
  }, [docId, userEmail, navigate]);

  const handleChange = (content, delta, source) => {
    if (source === 'user' && socketRef.current?.readyState === WebSocket.OPEN) {
      const encoded = new TextEncoder().encode(JSON.stringify(delta));
      const packet = new Uint8Array([0, ...encoded]);
      socketRef.current.send(packet);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/save/${docId}?client_version=${currentVersion}&user_email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.status === "success") {
        setCurrentVersion(result.version);
        alert(`Document saved successfully! Version ${result.version}`);
      } else if (result.status === "outdated") {
        const confirmRefresh = window.confirm(
          "Someone already saved a newer version. Your version is outdated. Refresh to sync with the latest version?"
        );
        if (confirmRefresh) window.location.reload();
      } else {
        alert(result.message || "Save failed.");
      }
    } catch (error) {
      console.error("Manual Save Error:", error);
      alert("Error saving document. Please try again.");
    }
  };

  // --- Handle Deletion ---
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this entire document? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/delete/${docId}?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.status === "success") {
        alert(result.message);
        navigate('/dashboard');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Error deleting document. Please try again.");
    }
  };

  // --- Handle Adding Users ---
  const handleAddUsers = async () => {
    const emails = emailInput.split(',').map(e => e.trim()).filter(e => e !== "");
    if (emails.length === 0) {
      alert("Please enter at least one email address");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/share/${docId}?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emails)
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Users added successfully!");
        setEmailInput("");
        setShowShareInput(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Share Error:", error);
      alert("Error adding users. Please try again.");
    }
  };

  return (
    <div className="full-screen-wrapper">
      <div className="status-bar">
        <div className="status-left">
          <span className={`status-indicator ${status.toLowerCase()}`}></span>
          <span className="status-text">Status: {status}</span>
          <span className="divider">|</span>
          <span className="doc-info">Document: {docId}</span>
          <span className="divider">|</span>
          <span className="version-info">Version: {currentVersion}</span>
        </div>
        
        <div className="status-right">
          <button className="action-button save-button" onClick={handleSave}>
            <span className="action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4h11l3 3v13H5V4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 4v6h8V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.5 20v-5h7v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Save
          </button>
          <button className="action-button share-button" onClick={() => setShowShareInput(!showShareInput)}>
            <span className="action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.5 20a3.5 3.5 0 0 0-7 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="13" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M4 20a3.2 3.2 0 0 1 4.8-2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="7.5" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            </span>
            Share
          </button>
          <button className="action-button delete-button" onClick={handleDelete}>
            <span className="action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 7l1 12h8l1-12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            Delete
          </button>
          <button className="action-button dashboard-button" onClick={() => navigate('/dashboard')}>
            <span className="action-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M10 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Dashboard
          </button>
        </div>
      </div>

      {showShareInput && (
        <div className="share-panel">
          <div className="share-panel-content">
            <h3>Share Document</h3>
            <p>Enter email addresses separated by commas</p>
            <input 
              type="text" 
              placeholder="email1@example.com, email2@example.com" 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="share-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddUsers()}
            />
            <div className="share-buttons">
              <button className="action-button primary" onClick={handleAddUsers}>
                Add Users
              </button>
              <button className="action-button secondary" onClick={() => {
                setShowShareInput(false);
                setEmailInput("");
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="outer-boundary">
        <div className="editor-container">
          <ReactQuill ref={quillRef} theme="snow" onChange={handleChange} />
        </div>
      </div>
    </div>
  );
};

export default App;