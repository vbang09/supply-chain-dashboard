import requests
import sys
import json
from datetime import datetime

class SupplyChainAPITester:
    def __init__(self, base_url="https://supply-chain-tracker.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=10):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success:
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict):
                        details += f", Keys: {list(response_data.keys())}"
                    elif isinstance(response_data, list):
                        details += f", Items count: {len(response_data)}"
                except:
                    details += ", Response: Non-JSON"
            else:
                try:
                    error_content = response.json()
                    details += f", Error: {error_content}"
                except:
                    details += f", Error: {response.text[:100]}"

            self.log_result(name, success, details)
            return success, response.json() if success else {}

        except Exception as e:
            details = f"Exception: {str(e)}"
            self.log_result(name, False, details)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_dashboards_empty(self):
        """Test getting dashboards when empty"""
        success, response = self.run_test("Get Dashboards (Empty)", "GET", "dashboards", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} dashboards")
        return success, response

    def test_seed_data(self):
        """Test seeding sample data"""
        success, response = self.run_test("Seed Data", "POST", "seed", 200)
        if success:
            print(f"   Created: {response.get('dashboards', 0)} dashboards, {response.get('projects', 0)} projects")
        return success, response

    def test_get_dashboards_after_seed(self):
        """Test getting dashboards after seeding"""
        success, response = self.run_test("Get Dashboards (After Seed)", "GET", "dashboards", 200)
        if success:
            print(f"   Found {len(response)} dashboards")
            if len(response) > 0:
                # Validate dashboard structure
                dashboard = response[0]
                required_fields = ['id', 'name', 'status', 'last_updated', 'impact', 'owner']
                missing_fields = [field for field in required_fields if field not in dashboard]
                if missing_fields:
                    print(f"   Missing fields in dashboard: {missing_fields}")
                    return False, response
                else:
                    print(f"   Dashboard structure valid")
        return success, response

    def test_get_projects_empty(self):
        """Test getting projects when empty"""
        return self.run_test("Get Projects (Empty)", "GET", "projects", 200)

    def test_get_projects_after_seed(self):
        """Test getting projects after seeding"""
        success, response = self.run_test("Get Projects (After Seed)", "GET", "projects", 200)
        if success:
            print(f"   Found {len(response)} projects")
            if len(response) > 0:
                # Validate project structure
                project = response[0]
                required_fields = ['id', 'name', 'created_by', 'assigned_to', 'status', 'progress']
                missing_fields = [field for field in required_fields if field not in project]
                if missing_fields:
                    print(f"   Missing fields in project: {missing_fields}")
                    return False, response
                else:
                    print(f"   Project structure valid")
                    
                # Check progress values
                invalid_progress = [p for p in response if p.get('progress', 0) < 0 or p.get('progress', 0) > 100]
                if invalid_progress:
                    print(f"   Found {len(invalid_progress)} projects with invalid progress values")
                    
                # Check status values
                valid_statuses = ['assigned', 'started', 'in_progress', 'done']
                invalid_statuses = [p for p in response if p.get('status') not in valid_statuses]
                if invalid_statuses:
                    print(f"   Found {len(invalid_statuses)} projects with invalid status")
                
        return success, response

    def test_create_dashboard(self):
        """Test creating a new dashboard"""
        test_dashboard = {
            "name": "Test Dashboard",
            "status": "active",
            "last_updated": "2026-01-15T12:00:00Z",
            "impact": "medium",
            "owner": "Test User",
            "description": "Test dashboard for API testing"
        }
        
        success, response = self.run_test("Create Dashboard", "POST", "dashboards", 200, test_dashboard)
        if success and 'id' in response:
            print(f"   Created dashboard with ID: {response['id']}")
        return success, response

    def test_create_project(self):
        """Test creating a new project"""
        test_project = {
            "name": "Test Project API",
            "description": "Test project for API validation",
            "created_by": "Test Creator",
            "assigned_to": "Test Assignee", 
            "created_at": "2026-01-15T12:00:00Z",
            "status": "assigned",
            "progress": 0,
            "current_note": "Starting test project",
            "completed_tasks": [],
            "jira_id": "TEST-001"
        }
        
        success, response = self.run_test("Create Project", "POST", "projects", 200, test_project)
        if success and 'id' in response:
            print(f"   Created project with ID: {response['id']}")
        return success, response

    def run_full_test_suite(self):
        """Run complete test suite"""
        print("🚀 Starting Supply Chain API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Test sequence
        tests = [
            ("Root Endpoint", self.test_root_endpoint),
            ("Get Dashboards (Initial)", self.test_get_dashboards_empty),
            ("Get Projects (Initial)", self.test_get_projects_empty),
            ("Seed Sample Data", self.test_seed_data),
            ("Get Dashboards (After Seed)", self.test_get_dashboards_after_seed),
            ("Get Projects (After Seed)", self.test_get_projects_after_seed),
            ("Create Dashboard", self.test_create_dashboard),
            ("Create Project", self.test_create_project),
        ]

        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log_result(test_name, False, f"Test function error: {str(e)}")

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed - check logs above")
            return 1

def main():
    tester = SupplyChainAPITester()
    return tester.run_full_test_suite()

if __name__ == "__main__":
    sys.exit(main())