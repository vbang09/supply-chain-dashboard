// GitHub Raw URLs for your data files
// These will be fetched directly from GitHub

export const DATA_CONFIG = {
  // Raw GitHub URLs for your JSON files
  DASHBOARDS_URL: 'https://raw.githubusercontent.com/vbang09/supply-chain-dashboard/main/dashboards.json',
  PROJECTS_URL: 'https://raw.githubusercontent.com/vbang09/supply-chain-dashboard/main/SCT2.json',
  
  // JIRA form URL for submitting new project requests
  JIRA_FORM_URL: 'https://toppsdigital.atlassian.net/jira/core/projects/SCT2/form/309',
  
  // Cache duration in milliseconds (5 minutes)
  CACHE_DURATION: 5 * 60 * 1000,
};

// Transform dashboard data from your JSON format to app format
export const transformDashboardData = (rawData) => {
  return rawData.map((item, index) => ({
    id: `dashboard-${index}`,
    name: item.Dashboard,
    url: item.DashboardLink,
    status: item.StatusLabel?.toLowerCase() === 'active' ? 'active' : 
            item.StatusLabel?.toLowerCase() === 'maintenance' ? 'maintenance' : 'inactive',
    last_updated: item.LastDateUpdated,
    ongoing_issues: item.OngoingIssues === 'nan' || !item.OngoingIssues ? null : item.OngoingIssues,
    impact: item.DiffDays === 0 ? 'low' : item.DiffDays <= 3 ? 'medium' : item.DiffDays <= 7 ? 'high' : 'critical',
    owner: null,
    description: null,
    diff_days: item.DiffDays,
  }));
};

// Transform project data from JIRA JSON format to app format
export const transformProjectData = (rawData) => {
  const statusMap = {
    'done': 'done',
    'in progress': 'in_progress',
    'to do': 'assigned',
    'open': 'assigned',
    'started': 'started',
  };

  const getProgress = (status) => {
    switch (status) {
      case 'done': return 100;
      case 'in_progress': return 60;
      case 'started': return 30;
      case 'assigned': return 10;
      default: return 0;
    }
  };

  return rawData.items?.map((item) => {
    const normalizedStatus = statusMap[item.status?.toLowerCase()] || 'assigned';
    
    return {
      id: item.key,
      name: item.name,
      description: item.type,
      created_by: item.reporter,
      assigned_to: item.assignee,
      created_at: item.dates?.created,
      status: normalizedStatus,
      progress: getProgress(normalizedStatus),
      current_note: item.displayDates?.in_progress 
        ? `In progress since ${item.displayDates.in_progress}` 
        : item.displayDates?.done 
        ? `Completed on ${item.displayDates.done}`
        : `Created on ${item.displayDates?.created}`,
      completed_tasks: normalizedStatus === 'done' ? ['Completed'] : [],
      jira_id: item.key,
    };
  }) || [];
};
