CREATE OR REPLACE FUNCTION update_updated_at()
-- IDEALLY DO FOR EVERY TABLE for UPDATED TIME
CREATE TRIGGER set_updated_at_projects
CREATE TRIGGER set_updated_at_timesheet

-------
CREATE OR REPLACE FUNCTION generate_timesheet_view_v3(
    start_date DATE,
    end_date DATE,
    selected_project UUID DEFAULT NULL,
    selected_user UUID DEFAULT NULL
)

-------
CREATE OR REPLACE FUNCTION update_expensed_hours(timesheet_id UUID)