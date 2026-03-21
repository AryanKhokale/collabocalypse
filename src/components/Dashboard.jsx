import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const BACKEND_URL = "http://127.0.0.1:8000";
const DEFAULT_TEMPLATE_NAMES = [
  'Letter',
  'Informal Letter',
  'Project Proposal',
  'Meeting Notes',
  'Resume',
  'Business Letter'
];

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
  const [documentsMode, setDocumentsMode] = useState('recent');
  const [selectedTemplateType, setSelectedTemplateType] = useState('');
  const [templateNames, setTemplateNames] = useState(DEFAULT_TEMPLATE_NAMES);
  const [newDocId, setNewDocId] = useState('');
  const [activeView, setActiveView] = useState('home');

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

  useEffect(() => {
    if (userEmail) {
      handleDocumentsFetch('recent');
      fetchAllTemplates();
    }
  }, [userEmail]);

  const fetchAllTemplates = async () => {
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/all-templates`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      const result = await response.json();
      const templates = Array.isArray(result)
        ? result
        : result?.templates || result?.data || [];

      if (Array.isArray(templates) && templates.length > 0) {
        setTemplateNames(templates);
      }
    } catch (error) {
      console.error('All templates fetch error:', error);
      // Keep static fallback if API fetch fails.
      setTemplateNames(DEFAULT_TEMPLATE_NAMES);
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocId.trim()) {
      alert('Please enter a document ID');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('access_token');
      const endpoint = selectedTemplateType ? 'create_with_template' : 'create';
      const query = selectedTemplateType
        ? `doc_id=${encodeURIComponent(newDocId.trim())}&admin_email=${encodeURIComponent(userEmail)}&temp_type=${encodeURIComponent(selectedTemplateType)}`
        : `doc_id=${encodeURIComponent(newDocId.trim())}&admin_email=${encodeURIComponent(userEmail)}`;
      const response = await fetch(
        `${BACKEND_URL}/${endpoint}?${query}`,
        { 
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        setSelectedTemplateType('');
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

  const handleDocumentsFetch = async (mode = 'recent') => {
    setLoading(true);
    try {
      const endpoint = mode === 'all' ? 'my-documents' : 'my-recent-documents';
      const response = await fetch(
        `${BACKEND_URL}/${endpoint}?admin_email=${encodeURIComponent(userEmail)}`
      );

      const rawText = await response.text();
      let result;
      try {
        result = JSON.parse(rawText);
      } catch {
        result = rawText;
      }

      const docsCandidate = Array.isArray(result)
        ? result
        : result?.documents || result?.recent_documents || result?.recent_docs || result?.data || result;

      const normalizedDocs = Array.isArray(docsCandidate)
        ? docsCandidate
            .map((doc) =>
              typeof doc === 'string'
                ? doc
                : doc?.docid || doc?.document_id || doc?.id || doc?.name
            )
            .filter(Boolean)
        : typeof docsCandidate === 'string' && docsCandidate.trim()
          ? [docsCandidate.trim()]
          : [];

      if (!response.ok) {
        alert((result && (result.message || result.detail)) || 'Failed to fetch documents');
      }

      setDocumentsMode(mode);
      setMyDocuments(normalizedDocs);
      setShowMyDocuments(true);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="app-name">Collabocalypse</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('home');
              handleDocumentsFetch('recent');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </button>
          
          <button className={`nav-item ${activeView === 'create' ? 'active' : ''}`} onClick={() => { setActiveView('create'); setShowCreateInput(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            <span>New Document</span>
          </button>
          
          <button className={`nav-item ${activeView === 'open' ? 'active' : ''}`} onClick={() => { setActiveView('open'); setShowOpenInput(true); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <span>Open Document</span>
          </button>
          
          <button
            className={`nav-item ${activeView === 'documents' ? 'active' : ''}`}
            onClick={() => {
              setActiveView('documents');
              handleDocumentsFetch('all');
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>My Documents</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Greeting Section */}
        <div className="greeting-section">
          <h1 className="greeting">{getGreeting()}, {userName}</h1>
          <p className="user-email">{userEmail}</p>
        </div>

        {/* New Document Section */}
        {activeView === 'home' && (
          <>
            <section className="new-document-section">
              <h2 className="section-title">Start a new document</h2>
              <div className="templates-grid">
                <div
                  className="template-card"
                  onClick={() => {
                    setSelectedTemplateType('');
                    setShowCreateInput(true);
                  }}
                >
                  <div className="template-preview blank-doc">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="2" width="18" height="20" rx="2" ry="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <p className="template-name">Blank collaborative document</p>
                </div>
              </div>
            </section>

            <section className="new-document-section">
              <h2 className="section-title">Create with templates</h2>
              <div className="templates-grid">
                {templateNames.map((templateName) => (
                  <div
                    key={templateName}
                    className="template-card"
                    onClick={() => {
                      setSelectedTemplateType(templateName);
                      setShowCreateInput(true);
                    }}
                  >
                    <div className="template-preview blank-doc">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="2" width="18" height="20" rx="2" ry="2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <p className="template-name">{templateName}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Recent Documents Section */}
        {showMyDocuments && (activeView === 'home' || activeView === 'documents') && (
          <section className="recent-documents-section">
            <h2 className="section-title">{documentsMode === 'all' ? 'My documents' : 'Recent documents'}</h2>
            {loading ? (
              <div className="loading-state">Loading documents...</div>
            ) : myDocuments.length === 0 ? (
              <div className="empty-state">No documents yet</div>
            ) : (
              <div className="documents-table">
                <div className="table-header">
                  <div className="col-name">Name</div>
                  <div className="col-modified">Last modified</div>
                </div>
                <div className="table-body">
                  {myDocuments.map((doc, index) => (
                    <div 
                      key={index} 
                      className="table-row"
                      onClick={() => handleDocumentClick(doc)}
                    >
                      <div className="col-name">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>{doc}</span>
                      </div>
                      <div className="col-modified">{documentsMode === 'all' ? '-' : 'Recently'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Modals for Create/Open */}
        {showCreateInput && (
          <div className="modal-overlay" onClick={() => setShowCreateInput(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>{selectedTemplateType ? `Create ${selectedTemplateType}` : 'Create new document'}</h3>
              <input
                type="text"
                placeholder="Enter document name"
                value={newDocId}
                onChange={(e) => setNewDocId(e.target.value)}
                className="modal-input"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
                autoFocus
              />
              <div className="modal-actions">
                <button 
                  className="modal-button primary" 
                  onClick={handleCreateDocument}
                  disabled={loading || !newDocId.trim()}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button 
                  className="modal-button" 
                  onClick={() => {
                    setShowCreateInput(false);
                    setNewDocId('');
                    setSelectedTemplateType('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showOpenInput && (
          <div className="modal-overlay" onClick={() => setShowOpenInput(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Open document</h3>
              <input
                type="text"
                placeholder="Enter document ID"
                value={docIdInput}
                onChange={(e) => setDocIdInput(e.target.value)}
                className="modal-input"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleOpenDocument()}
                autoFocus
              />
              <div className="modal-actions">
                <button 
                  className="modal-button primary" 
                  onClick={handleOpenDocument}
                  disabled={loading || !docIdInput.trim()}
                >
                  {loading ? 'Opening...' : 'Open'}
                </button>
                <button 
                  className="modal-button" 
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

