import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const BACKEND_URL = "http://127.0.0.1:8000";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [docIdInput, setDocIdInput] = useState('');
  const [showOpenInput, setShowOpenInput] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [myDocuments, setMyDocuments] = useState([]);
  const [showMyDocuments, setShowMyDocuments] = useState(false);
  const [newDocId, setNewDocId] = useState('');

  useEffect(() => {
    const email = sessionStorage.getItem('user_email');
    const name = sessionStorage.getItem('user_name');
    
    if (!email) {
      navigate('/');
      return;
    }
    
    setUserEmail(email);
    setUserName(name || 'User');
  }, [navigate]);

  const handleCreateDocument = async () => {
    if (!newDocId.trim()) {
      alert('Please enter a document ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/create?doc_id=${encodeURIComponent(newDocId.trim())}&admin_email=${encodeURIComponent(userEmail)}`,
        { method: 'POST' }
      );

      const result = await response.json();

      if (result.status === 'success') {
        navigate(`/editor/${newDocId.trim()}`);
      } else {
        alert(result.message || 'Failed to create document');
      }
    } catch (error) {
      console.error('Create document error:', error);
      alert('Error creating document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async () => {
    if (!docIdInput.trim()) {
      alert('Please enter a document ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/open/${encodeURIComponent(docIdInput.trim())}?user_email=${encodeURIComponent(userEmail)}`
      );

      if (response.status === 403) {
        const result = await response.json();
        alert(result.detail || 'You do not have access to this document');
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        alert('Document not found');
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.status === 'success') {
        navigate(`/editor/${docIdInput.trim()}`);
      } else {
        alert(result.message || 'Failed to open document');
      }
    } catch (error) {
      console.error('Open document error:', error);
      alert('Error opening document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMyDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/my-documents?admin_email=${encodeURIComponent(userEmail)}`
      );

      const result = await response.json();

      if (result.status === 'success') {
        setMyDocuments(result.documents || []);
        setShowMyDocuments(true);
      } else {
        alert(result.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('My documents error:', error);
      alert('Error fetching documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = async (docId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/open/${encodeURIComponent(docId)}?user_email=${encodeURIComponent(userEmail)}`
      );

      if (response.status === 403) {
        const result = await response.json();
        alert(result.detail || 'You do not have access to this document');
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        alert('Document not found');
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.status === 'success') {
        navigate(`/editor/${docId}`);
      } else {
        alert(result.message || 'Failed to open document');
        setLoading(false);
      }
    } catch (error) {
      console.error('Open document error:', error);
      alert('Error opening document. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('access_token');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Welcome, {userName}</h1>
          <p className="user-email">{userEmail}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <div className="card-icon create-icon">📄</div>
          <h2>Create Document</h2>
          <p>Start a new collaborative document</p>
          {!showCreateInput ? (
            <button 
              className="card-button" 
              onClick={() => setShowCreateInput(true)}
              disabled={loading}
            >
              Create New Document
            </button>
          ) : (
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter document ID"
                value={newDocId}
                onChange={(e) => setNewDocId(e.target.value)}
                className="doc-input"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
              />
              <div className="input-buttons">
                <button 
                  className="card-button primary" 
                  onClick={handleCreateDocument}
                  disabled={loading || !newDocId.trim()}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button 
                  className="card-button secondary" 
                  onClick={() => {
                    setShowCreateInput(false);
                    setNewDocId('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-icon open-icon">🔓</div>
          <h2>Open Document</h2>
          <p>Access an existing document by ID</p>
          {!showOpenInput ? (
            <button 
              className="card-button" 
              onClick={() => setShowOpenInput(true)}
              disabled={loading}
            >
              Open Document
            </button>
          ) : (
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter document ID"
                value={docIdInput}
                onChange={(e) => setDocIdInput(e.target.value)}
                className="doc-input"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleOpenDocument()}
              />
              <div className="input-buttons">
                <button 
                  className="card-button primary" 
                  onClick={handleOpenDocument}
                  disabled={loading || !docIdInput.trim()}
                >
                  {loading ? 'Opening...' : 'Open'}
                </button>
                <button 
                  className="card-button secondary" 
                  onClick={() => {
                    setShowOpenInput(false);
                    setDocIdInput('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <div className="card-icon mydocs-icon">📚</div>
          <h2>My Documents</h2>
          <p>View all your documents</p>
          <button 
            className="card-button" 
            onClick={handleMyDocuments}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'View My Documents'}
          </button>
          
          {showMyDocuments && (
            <div className="documents-list">
              {myDocuments.length === 0 ? (
                <p className="no-documents">No documents found</p>
              ) : (
                <ul>
                  {myDocuments.map((doc, index) => (
                    <li 
                      key={index} 
                      className="document-item"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <span className="doc-id">{doc}</span>
                      <span className="doc-arrow">→</span>
                    </li>
                  ))}
                </ul>
              )}
              <button 
                className="close-list-button" 
                onClick={() => setShowMyDocuments(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

