# Fanatics Supply Chain Tech Dashboard - PRD

## Original Problem Statement
Build a supply chain tech website for Fanatics organization with:
- Dashboard status tracker showing 7-8 dashboards with active/inactive status, last updated, ongoing issues/updates, and impact
- Project tracker showing creator, assignee, creation date, progress bar (Assigned → Started → In Progress → Done), current status notes, and completed milestones
- Tab to submit project request (links to external JIRA form)
- Dark/Light theme toggle
- Data comes from JSON files (linked with JIRA export)

## User Choices
- No authentication needed
- Dashboard data from JSON/MongoDB showing active/inactive, last updated
- Project tracker data from JIRA JSON export
- All users have same access
- External JIRA link for project submission: https://toppsdigital.atlassian.net/jira/core/projects/SCT2/form/309
- Fanatics branding/logo theme

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Framer Motion + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Styling**: Dark/Light theme with Fanatics brand colors (Navy #09203F, Red #E53C2E)

## What's Been Implemented (Jan 2026)
- [x] Dashboard Status Page with 8 dashboard cards showing status, impact, owner, issues
- [x] Project Tracker Page with milestone progress bars, assignee/creator info, JIRA IDs
- [x] Dark/Light theme toggle with persistence
- [x] Navigation header with Fanatics branding
- [x] Submit Request link to external JIRA form
- [x] Stats summary bars on both pages
- [x] Filter tabs on Projects page (All, Assigned, Started, In Progress, Done)
- [x] Refresh functionality on both pages
- [x] Sample data seeding endpoint
- [x] CRUD APIs for dashboards and projects
- [x] Bulk upload endpoints for JSON data import

## API Endpoints
- `GET /api/dashboards` - List all dashboards
- `POST /api/dashboards` - Create dashboard
- `PUT /api/dashboards/{id}` - Update dashboard
- `DELETE /api/dashboards/{id}` - Delete dashboard
- `POST /api/dashboards/bulk` - Bulk upload dashboards from JSON
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/bulk` - Bulk upload projects from JSON
- `POST /api/seed` - Seed sample data

## Prioritized Backlog
### P0 (Done)
- All core features implemented

### P1 (Next)
- JSON file upload UI for bulk importing dashboard/project data
- Real-time dashboard health monitoring (ping URLs)
- Email/webhook notifications for status changes

### P2 (Future)
- Dashboard URL health check automation
- Historical status tracking and charts
- Team/department filtering
- Export reports to PDF/Excel
