from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class DashboardBase(BaseModel):
    name: str
    url: Optional[str] = None
    status: str = "active"  # active, inactive, maintenance
    last_updated: str
    ongoing_issues: Optional[str] = None
    impact: str = "low"  # low, medium, high, critical
    owner: Optional[str] = None
    description: Optional[str] = None

class Dashboard(DashboardBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DashboardCreate(DashboardBase):
    pass

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    created_by: str
    assigned_to: str
    created_at: str
    status: str = "assigned"  # assigned, started, in_progress, done
    progress: int = 0  # 0-100
    current_note: Optional[str] = None
    completed_tasks: List[str] = []
    jira_id: Optional[str] = None

class Project(ProjectBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ProjectCreate(ProjectBase):
    pass

class AppMetadata(BaseModel):
    model_config = ConfigDict(extra="ignore")
    key: str
    value: str

# ============ DASHBOARD ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Fanatics Supply Chain API"}

@api_router.get("/dashboards", response_model=List[Dashboard])
async def get_dashboards():
    dashboards = await db.dashboards.find({}, {"_id": 0}).to_list(100)
    return dashboards

@api_router.post("/dashboards", response_model=Dashboard)
async def create_dashboard(dashboard: DashboardCreate):
    dashboard_obj = Dashboard(**dashboard.model_dump())
    doc = dashboard_obj.model_dump()
    await db.dashboards.insert_one(doc)
    return dashboard_obj

@api_router.put("/dashboards/{dashboard_id}", response_model=Dashboard)
async def update_dashboard(dashboard_id: str, dashboard: DashboardCreate):
    existing = await db.dashboards.find_one({"id": dashboard_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    updated_data = dashboard.model_dump()
    updated_data["id"] = dashboard_id
    updated_data["created_at"] = existing.get("created_at", datetime.now(timezone.utc).isoformat())
    
    await db.dashboards.update_one({"id": dashboard_id}, {"$set": updated_data})
    return Dashboard(**updated_data)

@api_router.delete("/dashboards/{dashboard_id}")
async def delete_dashboard(dashboard_id: str):
    result = await db.dashboards.delete_one({"id": dashboard_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return {"message": "Dashboard deleted"}

@api_router.post("/dashboards/bulk")
async def bulk_upload_dashboards(dashboards: List[DashboardCreate]):
    """Upload multiple dashboards from JSON"""
    created = []
    for dash in dashboards:
        dashboard_obj = Dashboard(**dash.model_dump())
        doc = dashboard_obj.model_dump()
        await db.dashboards.insert_one(doc)
        created.append(dashboard_obj)
    return {"message": f"Created {len(created)} dashboards", "dashboards": created}

# ============ PROJECT ROUTES ============

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).to_list(100)
    return projects

@api_router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    project_obj = Project(**project.model_dump())
    doc = project_obj.model_dump()
    await db.projects.insert_one(doc)
    return project_obj

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project: ProjectCreate):
    existing = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    updated_data = project.model_dump()
    updated_data["id"] = project_id
    
    await db.projects.update_one({"id": project_id}, {"$set": updated_data})
    return Project(**updated_data)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

@api_router.post("/projects/bulk")
async def bulk_upload_projects(projects: List[ProjectCreate]):
    """Upload multiple projects from JSON"""
    created = []
    for proj in projects:
        project_obj = Project(**proj.model_dump())
        doc = project_obj.model_dump()
        await db.projects.insert_one(doc)
        created.append(project_obj)
    return {"message": f"Created {len(created)} projects", "projects": created}

# ============ METADATA ROUTES ============

@api_router.get("/metadata/{key}")
async def get_metadata(key: str):
    meta = await db.metadata.find_one({"key": key}, {"_id": 0})
    if not meta:
        return {"key": key, "value": None}
    return meta

@api_router.put("/metadata/{key}")
async def update_metadata(key: str, value: str):
    await db.metadata.update_one(
        {"key": key},
        {"$set": {"key": key, "value": value}},
        upsert=True
    )
    return {"key": key, "value": value}

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    """Seed initial sample data for dashboards and projects"""
    
    # Clear existing data
    await db.dashboards.delete_many({})
    await db.projects.delete_many({})
    
    # Sample dashboards
    sample_dashboards = [
        {"name": "Inventory Dashboard", "status": "active", "last_updated": "2026-01-15T10:30:00Z", "impact": "high", "owner": "John Smith", "description": "Real-time inventory tracking", "ongoing_issues": None},
        {"name": "Shipment Tracker", "status": "active", "last_updated": "2026-01-15T09:45:00Z", "impact": "critical", "owner": "Sarah Johnson", "description": "Live shipment monitoring", "ongoing_issues": None},
        {"name": "Warehouse Analytics", "status": "inactive", "last_updated": "2026-01-14T18:00:00Z", "impact": "medium", "owner": "Mike Brown", "description": "Warehouse performance metrics", "ongoing_issues": "Database connection issues"},
        {"name": "Order Management", "status": "active", "last_updated": "2026-01-15T11:00:00Z", "impact": "critical", "owner": "Emily Davis", "description": "Order processing dashboard", "ongoing_issues": None},
        {"name": "Vendor Portal", "status": "maintenance", "last_updated": "2026-01-13T14:30:00Z", "impact": "low", "owner": "Tom Wilson", "description": "Vendor relationship management", "ongoing_issues": "Scheduled maintenance till 5PM"},
        {"name": "Returns Processing", "status": "active", "last_updated": "2026-01-15T08:15:00Z", "impact": "medium", "owner": "Lisa Anderson", "description": "Returns and refunds tracking", "ongoing_issues": None},
        {"name": "Logistics Hub", "status": "active", "last_updated": "2026-01-15T10:00:00Z", "impact": "high", "owner": "David Lee", "description": "Transportation and routing", "ongoing_issues": None},
        {"name": "Demand Forecast", "status": "inactive", "last_updated": "2026-01-12T16:45:00Z", "impact": "high", "owner": "Rachel Green", "description": "ML-powered demand predictions", "ongoing_issues": "Model retraining in progress"}
    ]
    
    # Sample projects
    sample_projects = [
        {
            "name": "Automated Inventory Sync",
            "description": "Implement real-time sync between warehouses",
            "created_by": "John Smith",
            "assigned_to": "Mike Brown",
            "created_at": "2026-01-05T09:00:00Z",
            "status": "in_progress",
            "progress": 65,
            "current_note": "API integration completed. Testing phase ongoing.",
            "completed_tasks": ["Requirements gathering", "API design", "Backend development"],
            "jira_id": "SCT2-101"
        },
        {
            "name": "Shipment ETA Predictor",
            "description": "ML model to predict accurate delivery times",
            "created_by": "Sarah Johnson",
            "assigned_to": "Rachel Green",
            "created_at": "2026-01-08T14:00:00Z",
            "status": "started",
            "progress": 25,
            "current_note": "Data collection phase. Training dataset being prepared.",
            "completed_tasks": ["Project kickoff", "Data source identification"],
            "jira_id": "SCT2-102"
        },
        {
            "name": "Vendor Scorecard System",
            "description": "Build automated vendor performance tracking",
            "created_by": "Tom Wilson",
            "assigned_to": "Emily Davis",
            "created_at": "2026-01-10T10:30:00Z",
            "status": "assigned",
            "progress": 10,
            "current_note": "Initial planning and stakeholder alignment.",
            "completed_tasks": ["Project assignment"],
            "jira_id": "SCT2-103"
        },
        {
            "name": "Returns Automation Pipeline",
            "description": "Automate returns processing workflow",
            "created_by": "Lisa Anderson",
            "assigned_to": "David Lee",
            "created_at": "2025-12-15T11:00:00Z",
            "status": "done",
            "progress": 100,
            "current_note": "Successfully deployed to production.",
            "completed_tasks": ["Requirements", "Design", "Development", "Testing", "Deployment"],
            "jira_id": "SCT2-089"
        },
        {
            "name": "Real-time Stock Alerts",
            "description": "Push notifications for low stock levels",
            "created_by": "John Smith",
            "assigned_to": "Tom Wilson",
            "created_at": "2026-01-12T08:00:00Z",
            "status": "in_progress",
            "progress": 45,
            "current_note": "Notification service integrated. Building alert rules engine.",
            "completed_tasks": ["Architecture design", "Notification service setup"],
            "jira_id": "SCT2-105"
        }
    ]
    
    # Insert dashboards
    for dash_data in sample_dashboards:
        dashboard = Dashboard(**dash_data)
        await db.dashboards.insert_one(dashboard.model_dump())
    
    # Insert projects
    for proj_data in sample_projects:
        project = Project(**proj_data)
        await db.projects.insert_one(project.model_dump())
    
    # Update metadata
    await db.metadata.update_one(
        {"key": "last_data_refresh"},
        {"$set": {"key": "last_data_refresh", "value": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    return {"message": "Seed data created successfully", "dashboards": len(sample_dashboards), "projects": len(sample_projects)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
