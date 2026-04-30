-- Alter User.role enum to include a read-only followup role
ALTER TABLE `User`
  MODIFY `role` ENUM('employee', 'supervisor', 'accounts', 'management', 'followup') NOT NULL DEFAULT 'employee';