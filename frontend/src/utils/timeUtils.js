export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const calculateCurrentTime = (project) => {
  if (!project.lastStateChange || project.currentState === 'STOPPED') {
    return {
      devTime: project.devTimeSeconds,
      waitTime: project.waitTimeSeconds
    };
  }

  const lastChange = new Date(project.lastStateChange);
  const now = new Date();
  const elapsedSeconds = Math.floor((now - lastChange) / 1000);

  let devTime = project.devTimeSeconds;
  let waitTime = project.waitTimeSeconds;

  if (project.currentState === 'DEV_ACTIVE') {
    devTime += elapsedSeconds;
  } else if (project.currentState === 'WAIT_ACTIVE') {
    waitTime += elapsedSeconds;
  }

  return { devTime, waitTime };
};

export const getTimerStateColor = (state) => {
  switch (state) {
    case 'DEV_ACTIVE':
      return 'dev';
    case 'WAIT_ACTIVE':
      return 'wait';
    default:
      return 'stopped';
  }
};

export const getTimerStateLabel = (state) => {
  switch (state) {
    case 'DEV_ACTIVE':
      return 'Development Active';
    case 'WAIT_ACTIVE':
      return 'Waiting on Customer';
    case 'STOPPED':
      return 'Stopped';
    default:
      return 'Unknown';
  }
};
