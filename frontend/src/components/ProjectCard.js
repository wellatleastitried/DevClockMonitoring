import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime, calculateCurrentTime, getTimerStateColor, getTimerStateLabel } from '../utils/timeUtils';
import { projectService, userService } from '../services/api';
import ConfirmationModal from './ConfirmationModal';

const ProjectCard = ({ project, user, onDelete, onTimerAction }) => {
  const [currentTimes, setCurrentTimes] = useState({ devTime: 0, waitTime: 0 });
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateTimes = () => {
      const times = calculateCurrentTime(project);
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [project.devTimeSeconds, project.waitTimeSeconds, project.currentState, project.lastStateChange]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const fetchUsers = async () => {
        try {
          const users = await userService.getAvailableUsers();
          setAvailableUsers(users);
        } catch (err) {
          console.error('Failed to fetch users:', err);
        }
      };
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAssignMenu && !event.target.closest('.assignment-menu')) {
        setShowAssignMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAssignMenu]);

  const stateColor = getTimerStateColor(project.currentState);
  const stateLabel = getTimerStateLabel(project.currentState);

  const handleTimerClick = (action) => {
    if ((action === 'dev' && project.currentState === 'DEV_ACTIVE') ||
        (action === 'wait' && project.currentState === 'WAIT_ACTIVE')) {
      onTimerAction(project.id, 'stop');
    } else {
      onTimerAction(project.id, action);
    }
  };

  const handleAssignUser = async (username) => {
    setLoadingAssignment(true);
    try {
      await projectService.assignProject(project.id, username);
      setShowAssignMenu(false);
    } catch (err) {
      console.error('Failed to assign user:', err);
      alert('Failed to assign user: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleAssignToAll = async () => {
    setLoadingAssignment(true);
    try {
      await projectService.assignProjectToAll(project.id);
      setShowAssignMenu(false);
    } catch (err) {
      console.error('Failed to assign to all users:', err);
      alert('Failed to assign to all users: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleUnassignUser = async () => {
    setLoadingAssignment(true);
    try {
      await projectService.unassignProject(project.id);
      setShowAssignMenu(false);
    } catch (err) {
      console.error('Failed to unassign user:', err);
      alert('Failed to unassign user: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await onDelete(project.id);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`project-card ${stateColor}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{project.description}</p>
          
          {/* Assignment Information */}
          <div className="text-xs text-gray-500 mb-2">
            {project.assignedToAll ? (
              <span>Assigned to: <span className="font-medium text-blue-700">All Users</span></span>
            ) : project.assignedUserUsername ? (
              <span>Assigned to: <span className="font-medium text-gray-700">{project.assignedUserUsername}</span></span>
            ) : (
              <span className="text-orange-600">Unassigned (Admin Only)</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {user?.role === 'ADMIN' && (
            <div className="relative assignment-menu">
              <button
                onClick={() => setShowAssignMenu(!showAssignMenu)}
                className="timer-button bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                title="Assign Project"
                disabled={loadingAssignment}
              >
                {loadingAssignment ? '...' : '👤'}
              </button>
              
              {showAssignMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-48">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-700 mb-2">Assign to user:</div>
                    
                    {/* All Users Option */}
                    <button
                      onClick={handleAssignToAll}
                      className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        project.assignedToAll 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700'
                      }`}
                      disabled={loadingAssignment}
                    >
                      <span className="font-medium">All Users</span>
                      <span className="text-xs text-gray-500 block">Visible to everyone</span>
                    </button>
                    
                    <hr className="my-2" />
                    
                    {/* Individual Users */}
                    {availableUsers.map((availableUser) => (
                      <button
                        key={availableUser.username}
                        onClick={() => handleAssignUser(availableUser.username)}
                        className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          project.assignedUserUsername === availableUser.username 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700'
                        }`}
                        disabled={loadingAssignment}
                      >
                        {availableUser.username}
                        {availableUser.displayName && (
                          <span className="text-xs text-gray-500 block">{availableUser.displayName}</span>
                        )}
                      </button>
                    ))}
                    
                    {(project.assignedUserUsername || project.assignedToAll) && (
                      <>
                        <hr className="my-2" />
                        <button
                          onClick={handleUnassignUser}
                          className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                          disabled={loadingAssignment}
                        >
                          Unassign
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {user?.role === 'ADMIN' && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Timeline button clicked for project:', project.id);
                  navigate(`/timeline/${project.id}`);
                }}
                className="timer-button dev px-3 py-1 text-sm mr-2"
                title="View Timeline"
              >
                📊
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="timer-button danger px-3 py-1 text-sm"
                title="Delete Project"
              >
                ×
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
        <div className="text-sm font-medium text-gray-900">{stateLabel}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Development Time</div>
          <div className={`time-display dev`}>{formatTime(currentTimes.devTime)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Wait Time</div>
          <div className={`time-display wait`}>{formatTime(currentTimes.waitTime)}</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleTimerClick('dev')}
          className={`timer-button dev flex-1 ${
            project.currentState === 'DEV_ACTIVE' ? 'active' : ''
          }`}
        >
          {project.currentState === 'DEV_ACTIVE' ? 'Stop Dev' : 'Start Dev'}
        </button>
        
        <button
          onClick={() => handleTimerClick('wait')}
          className={`timer-button wait flex-1 ${
            project.currentState === 'WAIT_ACTIVE' ? 'active' : ''
          }`}
        >
          {project.currentState === 'WAIT_ACTIVE' ? 'Stop Customer' : 'Start Customer'}
        </button>
        
        {project.currentState !== 'STOPPED' && (
          <button
            onClick={() => onTimerAction(project.id, 'stop')}
            className="timer-button stop px-3"
          >
            Stop
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently remove all project data including timeline entries.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProjectCard;
