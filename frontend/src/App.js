import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectList from './components/ProjectList';
import CreateProjectModal from './components/CreateProjectModal';
import UserHeader from './components/UserHeader';
import LoginPage from './components/LoginPage';
import ProjectTimeline from './components/ProjectTimeline';
import { projectService, userService, setUsername } from './services/api';
import { websocketService } from './services/websocket';

function App() {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('devClockUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('devClockUser');
  });
  const [searchTerm, setSearchTerm] = useState('');
  const updateInterval = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeApp();
      setupWebSocket();
    }

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      websocketService.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === '/') {
        event.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };

    if (isAuthenticated) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAuthenticated]);

  const handleLogin = async (username) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.getCurrentUser(username);
      setUser(userData);
      setIsAuthenticated(true);
      
      localStorage.setItem('devClockUser', JSON.stringify(userData));
      
    } catch (err) {
      console.error('Failed to authenticate user:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to authenticate user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const initializeApp = async () => {
    try {
      setLoading(true);
      
      const projectsData = await projectService.getAllProjects();
      setProjects(projectsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load application data');
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    websocketService.connect(() => {
      websocketService.subscribe('/topic/projects', (projects) => {
        setProjects(projects);
      });
    });
  };

  const updateActiveProjects = async () => {
    try {
      await projectService.updateActiveProjects();
    } catch (err) {
      console.error('Failed to update active projects:', err);
    }
  };

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      await projectService.createProject(projectData, user.username);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSearchTerm(''); // Clear search when logging out
    websocketService.disconnect();
    
    localStorage.removeItem('devClockUser');
  };

  const filteredProjects = projects.filter(project => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      (project.assignedUserUsername && project.assignedUserUsername.toLowerCase().includes(searchLower))
    );
  }).sort((a, b) => {
    if (!searchTerm.trim()) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    const getRelevanceScore = (project) => {
      let score = 0;
      const name = project.name.toLowerCase();
      const description = project.description.toLowerCase();
      
      if (name === searchLower) score += 100;
      else if (name.startsWith(searchLower)) score += 50;
      else if (name.includes(searchLower)) score += 25;
      
      if (description.includes(searchLower)) score += 10;
      
      if (project.assignedUserUsername && project.assignedUserUsername.toLowerCase().includes(searchLower)) {
        score += 15;
      }
      
      return score;
    };
    
    const scoreA = getRelevanceScore(a);
    const scoreB = getRelevanceScore(b);
    
    // Sort by relevance score (highest first), then by creation date
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId, user.username);
      } catch (err) {
        console.error('Failed to delete project:', err);
        alert('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleTimerAction = async (projectId, action) => {
    try {
      switch (action) {
        case 'dev':
          await projectService.startDevTimer(projectId);
          break;
        case 'wait':
          await projectService.startWaitTimer(projectId);
          break;
        case 'stop':
          await projectService.stopTimer(projectId);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Failed to update timer:', err);
      alert('Failed to update timer');
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        error={error}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => {
              setError(null);
              initializeApp();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <UserHeader 
          user={user} 
          onCreateProject={handleCreateProject}
          onLogout={handleLogout}
        />
        
        <Routes>
          <Route path="/" element={
            <main className="container mx-auto px-4 py-8">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search projects by name, description, or assigned user... (Ctrl+K)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Search Results Summary */}
                {searchTerm && (
                  <div className="text-center mt-2 text-sm text-gray-600">
                    {filteredProjects.length === 0 ? (
                      <span>No projects found matching "{searchTerm}"</span>
                    ) : (
                      <span>
                        {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
                        {filteredProjects.length !== projects.length && ` (of ${projects.length} total)`}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <ProjectList 
                projects={filteredProjects}
                user={user}
                onDeleteProject={handleDeleteProject}
                onTimerAction={handleTimerAction}
                isSearchActive={Boolean(searchTerm.trim())}
              />
            </main>
          } />
          <Route path="/timeline/:projectId" element={<ProjectTimeline user={user} />} />
        </Routes>

        {isCreateModalOpen && (
          <CreateProjectModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleProjectSubmit}
            userIsAdmin={user?.role === 'ADMIN'}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
