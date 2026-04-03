import { useState, useEffect, useMemo, useRef } from 'react';
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

const LETTER_TEMPLATE_PREVIEW_TEXT = `Your Name
123 Your Street
Your City, ST 12345
(123) 456-7890
no_reply@example.com

4th September 20XX
Ronny Reader
CEO, Company Name
123 Address St
Anytown, ST 12345

Dear Ms. Reader,
Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt.
Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl.

Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat.
Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim.

Sincerely,
Your Name`;

const PROJECT_PROPOSAL_PREVIEW_TEXT = `Project Name
09.04.20XX

Your Name
Your Company
123 Your Street
Your City, ST 12345

Overview
Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.

Goals
Lorem ipsum dolor sit amet, consectetuer adipiscing elit.

Specifications
Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum.

Milestones
Lorem ipsum dolor sit amet, consectetuer adipiscing elit.`;

const MEETING_NOTES_PREVIEW_TEXT = `Annual Board Meeting / TEAM Meeting
Friday, 09.04.20XX

Attendees
Wendy Writer, CEO
Ronny Reader, CFO
Abby Author, CTO

Agenda
Last Meeting Follow-up
New Business

Notes
Lorem ipsum dolor sit amet consectetuer adipiscing elit.

Action Items
Lorem ipsum dolor sit amet consectetuer adipiscing elit.

Next Meeting Agenda Items
Lorem ipsum dolor sit amet, consectetuer adipiscing elit.`;

const RESUME_PREVIEW_TEXT = `Hello
I\'m Your Name
123 YOUR STREET
YOUR CITY, ST 12345
(123) 456-7890
NO_REPLY@EXAMPLE.COM

Skills
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ac interdum nisi.

Experience
MONTH 20XX - PRESENT
Company Name, Location - Job Title
Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Education
MONTH 20XX - MONTH 20XX
College Name, Location - Degree

Awards
Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;

const PREVIEW_HEADINGS = {
  letter: new Set(['Dear Ms. Reader,', 'Sincerely,']),
  proposal: new Set(['Overview', 'Goals', 'Specifications', 'Lorem Ipsum', 'Milestones']),
  meeting: new Set(['Attendees', 'Agenda', 'Notes', 'Action Items', 'Next Meeting Agenda Items']),
  resume: new Set(['Skills', 'Experience', 'Education', 'Awards'])
};

const getInitialsFromEmail = (email = '') => {
  const localPart = String(email).split('@')[0] || '';
  const segments = localPart
    .split(/[^a-zA-Z0-9]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length >= 2) {
    return `${segments[0][0]}${segments[1][0]}`.toUpperCase();
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return 'NA';
};

const normalizeDocumentEntry = (doc) => {
  if (typeof doc === 'string') {
    const trimmedId = doc.trim();
    if (!trimmedId) return null;
    return { id: trimmedId, name: trimmedId, allowedUsers: [] };
  }

  if (!doc || typeof doc !== 'object') return null;

  const id = String(doc.docid || doc.doc_id || doc.document_id || doc.id || doc.name || '').trim();
  if (!id) return null;

  const allowedUsersRaw = doc.allowed_users || doc.allowedUsers || doc.collaborators || [];
  const allowedUsers = Array.isArray(allowedUsersRaw)
    ? [...new Set(allowedUsersRaw.map((user) => String(user).trim()).filter(Boolean))]
    : [];

  return { id, name: String(doc.name || id), allowedUsers };
};

const hashString = (value) => {
  return value.split('').reduce((acc, char, index) => {
    return acc + char.charCodeAt(0) * (index + 1);
  }, 0);
};

const getRelativeTime = (date) => {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 60) {
    return `edited ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `edited ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `edited ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};

const formatLastOpened = (date) => {
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [docIdInput, setDocIdInput] = useState('');
  const [showOpenInput, setShowOpenInput] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [myDocuments, setMyDocuments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [showMyDocuments, setShowMyDocuments] = useState(false);
  const [documentsMode, setDocumentsMode] = useState('recent');
  const [documentsQuery, setDocumentsQuery] = useState('');
  const [documentsSort, setDocumentsSort] = useState('recent');
  const [pinnedDocuments, setPinnedDocuments] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('All Documents');
  const [collapsedFolders, setCollapsedFolders] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [selectedTemplateType, setSelectedTemplateType] = useState('');
  const [templateNames, setTemplateNames] = useState(DEFAULT_TEMPLATE_NAMES);
  const [newDocId, setNewDocId] = useState('');
  const [activeView, setActiveView] = useState('home');
  const [selectedCreateFolder, setSelectedCreateFolder] = useState('Workspace');
  const [documentUpdates, setDocumentUpdates] = useState({});
  const [userFolders, setUserFolders] = useState([]);
  const [fileFolderMapping, setFileFolderMapping] = useState({});
  const [folderDeleteInProgress, setFolderDeleteInProgress] = useState(null);
  const [docDeleteInProgress, setDocDeleteInProgress] = useState(null);
  const [notes, setNotes] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const contentPanelRef = useRef(null);

  const sourceDocuments = useMemo(() => {
    return documentsSort === 'recent' ? recentDocuments : myDocuments;
  }, [documentsSort, recentDocuments, myDocuments]);

  const documentRecords = useMemo(() => {
    return sourceDocuments.map((docEntry, index) => {
      const docName = docEntry.name || docEntry.id;
      const score = hashString(docName);
      const folder = fileFolderMapping[docEntry.id] || docEntry.folder || 'Workspace';
      
      // Use real update time from /get-updates-info if available
      let lastOpenedAt = new Date(Date.now() - (score % 1440) * 60 * 1000); // fallback
      let activityAt = new Date(Date.now() - ((score % 300) + 15) * 60 * 1000); // fallback
      
      if (documentUpdates[docEntry.id]?.updated_at) {
        const updateTime = new Date(documentUpdates[docEntry.id].updated_at + 'Z');
        lastOpenedAt = updateTime;
        activityAt = updateTime;
      }
      
      const collaborators = (docEntry.allowedUsers || []).map((email) => ({
        email,
        initials: getInitialsFromEmail(email)
      }));
      const collaboratorsWithFallback =
        collaborators.length > 0
          ? collaborators
          : [{ email: userEmail || 'me@local', initials: getInitialsFromEmail(userEmail || 'me@local') }];

      return {
        id: docEntry.id,
        name: docName,
        folder,
        lastOpenedAt,
        activityAt,
        activityLabel: getRelativeTime(activityAt),
        collaborators: collaboratorsWithFallback,
        activeEditors: documentUpdates[docEntry.id]?.updated_by ? 1 : 0,
        lastUpdatedBy: documentUpdates[docEntry.id]?.updated_by || null
      };
    });
  }, [sourceDocuments, userEmail, documentUpdates, fileFolderMapping]);

  const folderStats = useMemo(() => {
    return userFolders.map((folderName) => ({
      folderName,
      count: documentRecords.filter((doc) => doc.folder === folderName).length
    }));
  }, [userFolders, documentRecords]);

  const visibleDocuments = useMemo(() => {
    const filtered = documentRecords.filter((doc) => {
      const matchesQuery = doc.name.toLowerCase().includes(documentsQuery.toLowerCase());
      const matchesFolder = selectedFolder === 'All Documents' || doc.folder === selectedFolder;
      return matchesQuery && matchesFolder;
    });

    if (documentsSort === 'az') {
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered.sort((a, b) => b.lastOpenedAt.getTime() - a.lastOpenedAt.getTime());
  }, [documentRecords, documentsQuery, documentsSort, selectedFolder]);

  const pinnedDocumentRecords = useMemo(() => {
    return visibleDocuments.filter((doc) => pinnedDocuments.includes(doc.id));
  }, [visibleDocuments, pinnedDocuments]);

  const suggestedDocuments = useMemo(() => {
    return visibleDocuments
      .filter((doc) => !recentlyViewed.includes(doc.id))
      .slice(0, 4);
  }, [visibleDocuments, recentlyViewed]);

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

  const fetchUserFolders = async (email) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/user-folders?user_email=${encodeURIComponent(email)}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('[user-folders] response:', data);
        
        // Store the file-to-folder mapping
        setFileFolderMapping(data || {});
        
        // Extract unique folder names from object values (not keys)
        if (data && typeof data === 'object') {
          const folderNames = [...new Set(Object.values(data))];
          console.log('[user-folders] extracted folders:', folderNames);
          
          if (folderNames.length > 0) {
            setUserFolders(folderNames);
          } else {
            setUserFolders(['Workspace']);
          }
        } else {
          setUserFolders(['Workspace']);
        }
      } else {
        setUserFolders(['Workspace']);
        setFileFolderMapping({});
      }
    } catch (error) {
      console.error('Error fetching user folders:', error);
      setUserFolders(['Workspace']);
      setFileFolderMapping({});
    }
  };

  useEffect(() => {
    if (userEmail) {
      handleDocumentsFetch('recent');
      fetchAllTemplates();
      fetchUserFolders(userEmail);
      fetchNotes(userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    if (activeView !== 'open' && showOpenInput) {
      setShowOpenInput(false);
    }
  }, [activeView, showOpenInput]);

  // Fetch update info for documents
  useEffect(() => {
    if (sourceDocuments.length === 0) {
      setDocumentUpdates({});
      return;
    }

    const fetchUpdates = async () => {
      const updates = {};
      for (const doc of sourceDocuments) {
        try {
          const response = await fetch(
            `${BACKEND_URL}/get-updates-info?doc_id=${encodeURIComponent(doc.id)}`
          );
          if (response.ok) {
            const data = await response.json();
            console.log(`[get-updates-info] ${doc.id}:`, data);
            updates[doc.id] = data;
          }
        } catch (error) {
          console.error(`Failed to fetch update info for ${doc.id}:`, error);
        }
      }
      console.log('[All document updates]:', updates);
      setDocumentUpdates(updates);
    };

    fetchUpdates();
  }, [sourceDocuments]);

  // Debug logging for folders
  useEffect(() => {
    console.log('[Folders Debug]', {
      userFolders,
      folderStats,
      folderCount: folderStats.length
    });
  }, [userFolders, folderStats]);

  // Restore scroll position when returning to documents view
  useEffect(() => {
    if (showMyDocuments && activeView === 'documents') {
      setTimeout(() => {
        const savedPosition = sessionStorage.getItem('dashboardScrollPosition');
        if (contentPanelRef.current && savedPosition) {
          const scrollValue = parseInt(savedPosition, 10);
          contentPanelRef.current.scrollTop = scrollValue;
          sessionStorage.removeItem('dashboardScrollPosition');
        }
      }, 100);
    }
  }, [showMyDocuments, activeView]);

  // Restore active view when returning to dashboard
  useEffect(() => {
    const savedView = sessionStorage.getItem('dashboardActiveView');
    if (savedView && savedView !== activeView) {
      setActiveView(savedView);
      sessionStorage.removeItem('dashboardActiveView');
    }
  }, [showMyDocuments]);

  // Also restore scroll position when visibleDocuments changes (ensures scroll is restored after data loads)
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('dashboardScrollPosition');
    if (savedPosition && contentPanelRef.current && showMyDocuments) {
      setTimeout(() => {
        const scrollValue = parseInt(savedPosition, 10);
        contentPanelRef.current.scrollTop = scrollValue;
        sessionStorage.removeItem('dashboardScrollPosition');
      }, 50);
    }
  }, [visibleDocuments]);

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
        // Add document to workspace/folder
        try {
          const workspaceQuery = `user_email=${encodeURIComponent(userEmail)}&docid=${encodeURIComponent(newDocId.trim())}&folder=${encodeURIComponent(selectedCreateFolder)}`;
          const workspaceResponse = await fetch(
            `${BACKEND_URL}/add-to-workspace?${workspaceQuery}`,
            {
              method: 'POST',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
          );
          
          const workspaceResult = await workspaceResponse.json();
          console.log('Add to workspace result:', workspaceResult);
        } catch (error) {
          console.error('Error adding document to workspace:', error);
          // Continue anyway - document is created even if folder assignment fails
        }

        setSelectedTemplateType('');
        setNewDocId('');
        setSelectedCreateFolder('Workspace');
        setShowCreateInput(false);
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
        alert('You may have been removed from this document by the admin, or the admin may have deleted this document.');
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        alert('You may have been removed from this document by the admin, or the admin may have deleted this document.');
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

      if (!response.ok) {
        alert(
          (result && (result.message || result.detail)) ||
            `Failed to fetch documents from /${endpoint}`
        );
        return;
      }

      // Extract documents array based on mode and response structure
      let docsArray = [];
      if (Array.isArray(result)) {
        // Direct array response
        docsArray = result;
      } else if (result && typeof result === 'object') {
        // Object response - extract based on mode
        if (mode === 'all') {
          // For /my-documents: look for "documents" key
          docsArray = result.documents || result.data || [];
        } else {
          // For /my-recent-documents: look for "recent_docs" key first
          docsArray = result.recent_docs || result.recent_documents || result.documents || result.data || [];
        }
      }

      let normalizedDocs = Array.isArray(docsArray)
        ? docsArray.map(normalizeDocumentEntry).filter(Boolean)
        : typeof docsArray === 'string' && docsArray.trim()
          ? [normalizeDocumentEntry(docsArray.trim())].filter(Boolean)
          : [];

      // For recent documents, fetch allowed_users for each doc to show correct collaborators
      if (mode === 'recent' && normalizedDocs.length > 0) {
        try {
          // Fetch all documents once to get allowed_users for recent docs
          const allDocsResponse = await fetch(
            `${BACKEND_URL}/my-documents?admin_email=${encodeURIComponent(userEmail)}`
          );
          if (allDocsResponse.ok) {
            const allDocsText = await allDocsResponse.text();
            const allDocsResult = JSON.parse(allDocsText);
            const allDocsList = allDocsResult.documents || [];
            
            // Create a map of docId -> allowed_users for quick lookup
            const docCollaboratorsMap = {};
            allDocsList.forEach(d => {
              if (typeof d === 'object' && d.allowed_users) {
                const docId = d.docid || d.id;
                docCollaboratorsMap[docId] = d.allowed_users;
              }
            });
            
            // Enrich recent docs with collaborators
            normalizedDocs = normalizedDocs.map(doc => ({
              ...doc,
              allowedUsers: docCollaboratorsMap[doc.id] || doc.allowedUsers
            }));
          }
        } catch (error) {
          console.error('Error enriching recent documents with collaborators:', error);
        }
      }

      setDocumentsMode(mode);
      if (mode === 'recent') {
        setRecentDocuments(normalizedDocs);
      } else {
        setMyDocuments(normalizedDocs);
      }
      setShowMyDocuments(true);
    } catch (error) {
      console.error('My documents error:', error);
      alert('Error fetching documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async (email) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/user-notes?user_email=${encodeURIComponent(email)}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('[user-notes] Fetched notes:', data);
        const fetchedNotes =
          typeof data === 'string'
            ? data
            : (data?.notes || data?.note || data?.data?.notes || '');
        setNotes(fetchedNotes);
        setNotesInput(fetchedNotes);
        setIsEditingNotes(false);
      } else {
        console.warn('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesInput.trim()) {
      alert('Notes cannot be empty.');
      return;
    }

    try {
      console.log('[user-notes] Saving notes:', notesInput);
      const response = await fetch(
        `${BACKEND_URL}/user-notes?user_email=${encodeURIComponent(userEmail)}&notes=${encodeURIComponent(notesInput)}`,
        {
          method: 'POST'
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('[user-notes] Save response:', result);
        setNotes(notesInput);
        setIsEditingNotes(false);
        alert('Notes saved successfully!');
      } else {
        alert('Failed to save notes.');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes.');
    }
  };

  const handleDocumentClick = async (docId) => {
    // Save current view and scroll position before navigating
    sessionStorage.setItem('dashboardActiveView', activeView);
    if (contentPanelRef.current) {
      sessionStorage.setItem('dashboardScrollPosition', contentPanelRef.current.scrollTop);
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/open/${encodeURIComponent(docId)}?user_email=${encodeURIComponent(userEmail)}`
      );

      if (response.status === 403) {
        alert('You may have been removed from this document by the admin, or the admin may have deleted this document.');
        setLoading(false);
        return;
      }

      if (response.status === 404) {
        alert('You may have been removed from this document by the admin, or the admin may have deleted this document.');
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.status === 'success') {
        setRecentlyViewed((current) => {
          const next = [docId, ...current.filter((item) => item !== docId)];
          return next.slice(0, 6);
        });
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

  const handleTogglePin = (event, docId) => {
    event.stopPropagation();
    setPinnedDocuments((current) => {
      if (current.includes(docId)) {
        return current.filter((id) => id !== docId);
      }
      return [...current, docId];
    });
  };

  const handleQuickRename = (event, docId) => {
    event.stopPropagation();
    const renamedDoc = window.prompt('Rename document', docId);
    if (!renamedDoc || !renamedDoc.trim() || renamedDoc.trim() === docId) {
      return;
    }

    setMyDocuments((current) =>
      current.map((doc) => (doc.id === docId ? { ...doc, id: renamedDoc.trim(), name: renamedDoc.trim() } : doc))
    );
    setRecentDocuments((current) =>
      current.map((doc) => (doc.id === docId ? { ...doc, id: renamedDoc.trim(), name: renamedDoc.trim() } : doc))
    );
    setPinnedDocuments((current) =>
      current.map((doc) => (doc === docId ? renamedDoc.trim() : doc))
    );
    setRecentlyViewed((current) =>
      current.map((doc) => (doc === docId ? renamedDoc.trim() : doc))
    );
  };

  const handleQuickDelete = async (event, docId) => {
    event.stopPropagation();
    const shouldDelete = window.confirm(`Delete "${docId}" from workspace?`);
    if (!shouldDelete) {
      return;
    }

    setDocDeleteInProgress(docId);
    try {
      const token = sessionStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/remove-from-workspace?user_email=${encodeURIComponent(userEmail)}&docid=${encodeURIComponent(docId)}`,
        {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      const result = await response.json();
      console.log('[remove-from-workspace] response:', result);

      if (response.ok || result.status === 'success') {
        // Remove from local state
        setMyDocuments((current) => current.filter((doc) => doc.id !== docId));
        setRecentDocuments((current) => current.filter((doc) => doc.id !== docId));
        setPinnedDocuments((current) => current.filter((doc) => doc !== docId));
        setRecentlyViewed((current) => current.filter((doc) => doc !== docId));
        alert(`"${docId}" removed successfully.`);
      } else {
        alert(result.message || 'Failed to remove document from workspace.');
      }
    } catch (error) {
      console.error('Error removing document:', error);
      alert('Error removing document from workspace.');
    } finally {
      setDocDeleteInProgress(null);
    }
  };

  const handleFolderDelete = async (folderName) => {
    const shouldDelete = window.confirm(`Delete all documents in "${folderName}" folder?`);
    if (!shouldDelete) {
      return;
    }

    setFolderDeleteInProgress(folderName);
    try {
      const token = sessionStorage.getItem('access_token');
      // Get all documents in this folder
      const docsInFolder = documentRecords.filter((doc) => doc.folder === folderName);
      
      if (docsInFolder.length === 0) {
        alert(`No documents in "${folderName}" folder.`);
        setFolderDeleteInProgress(null);
        return;
      }

      // Remove each document from the folder
      let successCount = 0;
      for (const doc of docsInFolder) {
        try {
          const response = await fetch(
            `${BACKEND_URL}/remove-from-workspace?user_email=${encodeURIComponent(userEmail)}&docid=${encodeURIComponent(doc.id)}`,
            {
              method: 'POST',
              headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
          );
          
          const result = await response.json();
          if (response.ok || result.status === 'success') {
            successCount++;
            // Remove from local state
            setMyDocuments((current) => current.filter((d) => d.id !== doc.id));
            setRecentDocuments((current) => current.filter((d) => d.id !== doc.id));
            setPinnedDocuments((current) => current.filter((d) => d !== doc.id));
            setRecentlyViewed((current) => current.filter((d) => d !== doc.id));
          }
        } catch (error) {
          console.error(`Error removing document ${doc.id}:`, error);
        }
      }

      alert(`Removed ${successCount} document(s) from "${folderName}" folder.`);
      setSelectedFolder('All Documents');
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Error deleting folder.');
    } finally {
      setFolderDeleteInProgress(null);
    }
  };

  const handleQuickShare = async (event, docId) => {
    event.stopPropagation();
    const shareUrl = `${window.location.origin}/editor/${encodeURIComponent(docId)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard.');
    } catch {
      alert(`Share link: ${shareUrl}`);
    }
  };

  const toggleFolderCollapse = (folderName) => {
    setCollapsedFolders((current) => {
      if (current.includes(folderName)) {
        return current.filter((name) => name !== folderName);
      }
      return [...current, folderName];
    });
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

  const getTemplateVariant = (templateName) => {
    const normalized = templateName.toLowerCase();

    if (normalized.includes('resume')) {
      return 'resume';
    }

    if (normalized.includes('proposal') || normalized.includes('business')) {
      return 'proposal';
    }

    if (normalized.includes('meeting')) {
      return 'meeting';
    }

    return 'letter';
  };

  const renderTemplatePreview = (templateName) => {
    const variant = getTemplateVariant(templateName);

    if (variant === 'resume') {
      return (
        <div className="template-mini-doc resume-doc" aria-hidden="true">
          <div className="mini-rich-text mini-rich-text-resume">{renderPreviewLines(RESUME_PREVIEW_TEXT, 'resume')}</div>
        </div>
      );
    }

    if (variant === 'meeting') {
      return (
        <div className="template-mini-doc meeting-doc" aria-hidden="true">
          <div className="mini-rich-text mini-rich-text-meeting">{renderPreviewLines(MEETING_NOTES_PREVIEW_TEXT, 'meeting')}</div>
        </div>
      );
    }

    if (variant === 'proposal') {
      return (
        <div className="template-mini-doc proposal-doc" aria-hidden="true">
          <div className="mini-rich-text mini-rich-text-proposal">{renderPreviewLines(PROJECT_PROPOSAL_PREVIEW_TEXT, 'proposal')}</div>
        </div>
      );
    }

    return (
      <div className="template-mini-doc letter-doc" aria-hidden="true">
        <div className="mini-rich-text mini-rich-text-letter">{renderPreviewLines(LETTER_TEMPLATE_PREVIEW_TEXT, 'letter')}</div>
      </div>
    );
  };

  const renderPreviewLines = (text, type) => {
    const headingSet = PREVIEW_HEADINGS[type] || new Set();

    return text.split('\n').map((rawLine, index) => {
      const line = rawLine.trim();
      let className = 'mini-text-line';

      if (!line) {
        className += ' blank';
      } else if (line === '-') {
        className += ' divider';
      } else if (headingSet.has(line)) {
        className += ' heading';
      } else if (line.includes('20XX') || line.includes('@') || line.includes('(123)')) {
        className += ' meta';
      }

      return (
        <div key={`${type}-${index}`} className={className}>
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="dashboard-container">
      {loading && (
        <div className="navigation-loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Opening document...</p>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="brand-row">
            <svg className="dashboard-logo" width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="6" y="4" width="20" height="24" rx="2" fill="none" stroke="#9f7aea" strokeWidth="1.8"/>
              <line x1="10" y1="10" x2="18" y2="10" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10" y1="14" x2="22" y2="14" stroke="#7dd3fc" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10" y1="18" x2="16" y2="18" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 9l0 6 2 -2 1.5 3 1.5 -0.5 -1.5 -3 2.5 0z" fill="#a855f7" stroke="#a855f7" strokeWidth="0.5"/>
              <path d="M13 21l0 5 1.5 -1.5 1 2.5 1.2 -0.5 -1 -2.5 2 0z" fill="#7dd3fc" stroke="#7dd3fc" strokeWidth="0.5"/>
            </svg>
            <h2 className="app-name">Collabocalypse</h2>
          </div>
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
      <div className="dashboard-main" ref={contentPanelRef}>
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
              <div className="templates-grid single-template-grid">
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
                    <div className="template-preview with-content">
                      {renderTemplatePreview(templateName)}
                    </div>
                    <p className="template-name">{templateName}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* My Documents Workspace */}
        {showMyDocuments && (activeView === 'home' || activeView === 'documents') && (
          <section className="documents-workspace-section">
            <div className="documents-toolbar">
              <div>
                <h2 className="section-title documents-section-title">
                  {documentsSort === 'recent' ? 'Recent documents' : 'My documents'}
                </h2>
                <p className="documents-subtitle">Search, sort, pin, and jump between folders instantly.</p>
              </div>
              <button
                className="new-document-cta"
                onClick={() => {
                  setSelectedTemplateType('');
                  setShowCreateInput(true);
                }}
              >
                New Document
                <svg className="new-document-cta-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="documents-controls-row">
              <div className="documents-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={documentsQuery}
                  onChange={(event) => setDocumentsQuery(event.target.value)}
                  placeholder="Search documents"
                />
              </div>

              <label className="documents-sort">
                <span>Sort</span>
                <select
                  value={documentsSort}
                  onChange={(event) => {
                    const newSort = event.target.value;
                    setDocumentsSort(newSort);
                    handleDocumentsFetch(newSort === 'recent' ? 'recent' : 'all');
                  }}
                >
                  <option value="recent">Recent</option>
                  <option value="az">A-Z</option>
                </select>
              </label>
            </div>

            <div className="documents-workspace-layout">
              <aside className="documents-folder-sidebar">
                <button
                  className={`folder-item ${selectedFolder === 'All Documents' ? 'active' : ''}`}
                  onClick={() => setSelectedFolder('All Documents')}
                >
                  <span>All Documents</span>
                  <span className="folder-count">{documentRecords.length}</span>
                </button>

                {folderStats.map((folder) => (
                  <div key={folder.folderName} className="folder-group">
                    <button
                      className={`folder-item ${selectedFolder === folder.folderName ? 'active' : ''}`}
                      onClick={() => setSelectedFolder(folder.folderName)}
                      onContextMenu={(event) => {
                        event.preventDefault();
                        handleFolderDelete(folder.folderName);
                      }}
                    >
                      <span>{folder.folderName}</span>
                      <span className="folder-meta">
                        <span className="folder-count">{folder.count}</span>
                        <button
                          className="folder-delete-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleFolderDelete(folder.folderName);
                          }}
                          title="Delete folder"
                          disabled={folderDeleteInProgress === folder.folderName}
                        >
                          {folderDeleteInProgress === folder.folderName ? '...' : '✕'}
                        </button>
                        <span
                          className={`folder-collapse-toggle ${collapsedFolders.includes(folder.folderName) ? 'collapsed' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFolderCollapse(folder.folderName);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleFolderCollapse(folder.folderName);
                            }
                          }}
                        >
                          ▾
                        </span>
                      </span>
                    </button>
                    {!collapsedFolders.includes(folder.folderName) && (
                      <div className="folder-preview">{folder.count > 0 ? 'Contains active files' : 'No files yet'}</div>
                    )}
                  </div>
                ))}
              </aside>

              <div className="documents-content-panel">
                <div className="documents-breadcrumb">
                  <span>Workspace</span>
                  <span>/</span>
                  <span>{selectedFolder}</span>
                </div>

                {loading ? (
                  <div className="loading-state">Loading documents...</div>
                ) : visibleDocuments.length === 0 ? (
                  <div className="empty-state">No documents match this view</div>
                ) : (
                  <>
                    {pinnedDocumentRecords.length > 0 && (
                      <div className="pinned-documents-card">
                        <h3>Pinned Documents</h3>
                        <div className="pinned-documents-list">
                          {pinnedDocumentRecords.map((doc) => (
                            <button
                              key={doc.id}
                              className="pinned-chip"
                              onClick={() => handleDocumentClick(doc.id)}
                            >
                              <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                              {doc.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="documents-list-card">
                      {visibleDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="document-row"
                          onClick={() => handleDocumentClick(doc.id)}
                        >
                          <button
                            className={`pin-toggle ${pinnedDocuments.includes(doc.id) ? 'is-pinned' : ''}`}
                            onClick={(event) => handleTogglePin(event, doc.id)}
                            aria-label={pinnedDocuments.includes(doc.id) ? 'Unpin document' : 'Pin document'}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </button>

                          <div className="document-main-info">
                            <div className="document-title-line">
                              <span className="document-name">{doc.name}</span>
                              <span className={`activity-dot ${doc.activeEditors > 0 ? 'active' : ''}`}>
                                {doc.activeEditors > 0 ? 'Active editing' : 'Idle'}
                              </span>
                            </div>
                            <div className="document-meta-line">
                              <span>Last opened {formatLastOpened(doc.lastOpenedAt)}</span>
                              <span>{doc.activityLabel}</span>
                            </div>
                          </div>

                          <div className="document-collaboration">
                            <div className="avatar-group" aria-label="Collaborators">
                              {doc.collaborators.slice(0, 3).map((person) => (
                                <span key={`${doc.id}-${person.email}`} className="avatar-pill" title={person.email}>
                                  {person.initials}
                                </span>
                              ))}
                            </div>
                            <span className="collaboration-count">
                              {doc.collaborators.length === 1
                                ? 'Only you'
                                : `${doc.collaborators.length} collaborators`}
                            </span>
                          </div>

                          <div className="document-quick-actions" onClick={(event) => event.stopPropagation()}>
                            <button onClick={() => handleDocumentClick(doc.id)} disabled={docDeleteInProgress === doc.id}>Open</button>
                            <button onClick={(event) => handleQuickRename(event, doc.id)} disabled={docDeleteInProgress === doc.id}>Rename</button>
                            <button onClick={(event) => handleQuickShare(event, doc.id)} disabled={docDeleteInProgress === doc.id}>Share</button>
                            <button className="danger" onClick={(event) => handleQuickDelete(event, doc.id)} disabled={docDeleteInProgress === doc.id}>
                              {docDeleteInProgress === doc.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="documents-insights-grid">
                      <div className="insight-card notes-card">
                        <div className="notes-card-header">
                          <h3>My Notes</h3>
                          {!isEditingNotes && (
                            <button
                              className="notes-icon-button"
                              onClick={() => {
                                setNotesInput(notes);
                                setIsEditingNotes(true);
                              }}
                            >
                              {notes ? 'Edit' : 'Start writing'}
                            </button>
                          )}
                        </div>

                        {isEditingNotes ? (
                          <div className="inline-notes-editor">
                            <textarea
                              className="notes-textarea"
                              value={notesInput}
                              onChange={(e) => setNotesInput(e.target.value)}
                              placeholder="Write your notes here..."
                              rows="7"
                            />
                            <div className="notes-actions">
                              <button
                                className="save-notes-btn"
                                onClick={handleSaveNotes}
                              >
                                Save Notes
                              </button>
                              <button
                                className="cancel-notes-btn"
                                onClick={() => {
                                  setNotesInput(notes);
                                  setIsEditingNotes(false);
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`insight-notes-display ${notes ? 'has-note' : 'empty'}`}>
                            {notes ? (
                              <p className="notes-content">{notes}</p>
                            ) : (
                              <p className="notes-placeholder">No notes yet. Start writing.</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="insight-card">
                        <h3>Suggested Documents</h3>
                        {suggestedDocuments.length === 0 ? (
                          <p>Suggestions will appear as your activity grows.</p>
                        ) : (
                          <div className="insight-list">
                            {suggestedDocuments.map((doc) => (
                              <button
                                key={`suggested-${doc.id}`}
                                className="insight-item"
                                onClick={() => handleDocumentClick(doc.id)}
                              >
                                <span>{doc.name}</span>
                                <small>{doc.activityLabel}</small>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
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
              <div className="modal-folder-selector">
                <label htmlFor="folder-input">Add to folder:</label>
                <input
                  id="folder-input"
                  type="text"
                  placeholder="e.g., Workspace, Project X, etc."
                  value={selectedCreateFolder}
                  onChange={(e) => setSelectedCreateFolder(e.target.value)}
                  className="modal-folder-input"
                  disabled={loading}
                />
              </div>
              {userFolders.length > 0 && (
                <div className="modal-available-folders">
                  <label>Available folders:</label>
                  <div className="modal-folder-chips">
                    {userFolders.map((folder) => (
                      <button
                        key={folder}
                        className={`modal-folder-chip ${selectedCreateFolder === folder ? 'active' : ''}`}
                        onClick={() => setSelectedCreateFolder(folder)}
                        disabled={loading}
                        type="button"
                      >
                        {folder}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                    setSelectedCreateFolder('Workspace');
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

