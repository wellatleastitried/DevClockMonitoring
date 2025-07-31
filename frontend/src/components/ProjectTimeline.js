import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/api';
import { formatTime } from '../utils/timeUtils';

const ProjectTimeline = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.role || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    fetchProjectData();
  }, [projectId, user, navigate]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
      
      // Fetch actual timeline data from backend
      try {
        const timelineResponse = await projectService.getProjectTimeline(projectId);
        setTimelineData(timelineResponse);
      } catch (timelineErr) {
        console.warn('Timeline endpoint not available yet:', timelineErr);
        setTimelineData([]);
      }
    } catch (err) {
      console.error('Failed to fetch project data:', err);
      setError('Failed to load project timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Timeline</h1>
                <p className="text-sm text-gray-600">{project.name}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Time Tracked</div>
              <div className="text-lg font-medium text-gray-900">
                {formatTime(project.devTimeSeconds + project.waitTimeSeconds)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Time Tracking Overview</h2>
            <p className="text-gray-600">{project.description}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600">Development Time</div>
              <div className="text-2xl font-bold text-blue-700">{formatTime(project.devTimeSeconds)}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-600">Customer Wait Time</div>
              <div className="text-2xl font-bold text-orange-700">{formatTime(project.waitTimeSeconds)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600">Total Duration</div>
              <div className="text-2xl font-bold text-gray-700">
                {formatTime(project.devTimeSeconds + project.waitTimeSeconds)}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
            
            {timelineData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No timeline data available yet. Start tracking time to see activity history.
              </div>
            ) : (
              <div className="space-y-4">
                {timelineData.map((entry, index) => (
                  <div key={entry.id} className="flex items-start space-x-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${
                        entry.type === 'created' ? 'bg-gray-400' :
                        entry.type === 'dev' ? 'bg-blue-500' : 'bg-orange-500'
                      }`} />
                      {index < timelineData.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                      )}
                    </div>
                    
                    {/* Timeline content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                          <p className="text-xs text-gray-500">
                            {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {entry.duration > 0 && (
                          <div className="text-sm font-medium text-gray-600">
                            {formatTime(entry.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Assignment Info */}
          {(project.assignedUserUsername || project.assignedToAll) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment</h3>
              <p className="text-gray-600">
                {project.assignedToAll ? (
                  <span>Assigned to: <span className="font-medium text-blue-700">All Users</span></span>
                ) : (
                  <span>Assigned to: <span className="font-medium text-gray-700">{project.assignedUserUsername}</span></span>
                )}
              </p>
            </div>
          )}

          {/* Current Status */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current Status</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              project.currentState === 'DEV_ACTIVE' ? 'bg-blue-100 text-blue-800' :
              project.currentState === 'WAIT_ACTIVE' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.currentState === 'DEV_ACTIVE' ? 'Development Active' :
               project.currentState === 'WAIT_ACTIVE' ? 'Customer Wait Active' :
               'Stopped'}
            </div>
            {project.lastStateChange && (
              <p className="text-sm text-gray-500 mt-1">
                Last changed: {new Date(project.lastStateChange).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
