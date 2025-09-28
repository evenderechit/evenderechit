-- Create user management system tables and functions

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions) VALUES
('owner', 'בעל עסק', 'בעל העסק - כל ההרשאות', '{
  "appointments": {"create": true, "read": true, "update": true, "delete": true},
  "clients": {"create": true, "read": true, "update": true, "delete": true},
  "services": {"create": true, "read": true, "update": true, "delete": true},
  "staff": {"create": true, "read": true, "update": true, "delete": true},
  "analytics": {"read": true},
  "settings": {"read": true, "update": true},
  "users": {"create": true, "read": true, "update": true, "delete": true}
}'),
('admin', 'מנהל', 'מנהל העסק - רוב ההרשאות', '{
  "appointments": {"create": true, "read": true, "update": true, "delete": true},
  "clients": {"create": true, "read": true, "update": true, "delete": true},
  "services": {"create": true, "read": true, "update": true, "delete": true},
  "staff": {"create": true, "read": true, "update": true, "delete": false},
  "analytics": {"read": true},
  "settings": {"read": true, "update": false},
  "users": {"create": false, "read": true, "update": false, "delete": false}
}'),
('staff', 'עובד', 'עובד - הרשאות בסיסיות', '{
  "appointments": {"create": true, "read": true, "update": true, "delete": false},
  "clients": {"create": false, "read": true, "update": false, "delete": false},
  "services": {"create": false, "read": true, "update": false, "delete": false},
  "staff": {"create": false, "read": true, "update": false, "delete": false},
  "analytics": {"read": false},
  "settings": {"read": true, "update": false},
  "users": {"create": false, "read": false, "update": false, "delete": false}
}'),
('receptionist', 'קבלה', 'עובד קבלה - ניהול תורים ולקוחות', '{
  "appointments": {"create": true, "read": true, "update": true, "delete": false},
  "clients": {"create": true, "read": true, "update": true, "delete": false},
  "services": {"create": false, "read": true, "update": false, "delete": false},
  "staff": {"create": false, "read": true, "update": false, "delete": false},
  "analytics": {"read": false},
  "settings": {"read": true, "update": false},
  "users": {"create": false, "read": false, "update": false, "delete": false}
}'),
('viewer', 'צופה', 'צפייה בלבד', '{
  "appointments": {"create": false, "read": true, "update": false, "delete": false},
  "clients": {"create": false, "read": true, "update": false, "delete": false},
  "services": {"create": false, "read": true, "update": false, "delete": false},
  "staff": {"create": false, "read": true, "update": false, "delete": false},
  "analytics": {"read": false},
  "settings": {"read": true, "update": false},
  "users": {"create": false, "read": false, "update": false, "delete": false}
}')
ON CONFLICT (name) DO NOTHING;

-- Create business_users table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS business_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_owner_id, user_id)
);

-- Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activity table for audit logging
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_users_business_owner ON business_users(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_business_users_user ON business_users(user_id);
CREATE INDEX IF NOT EXISTS idx_business_users_status ON business_users(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_business_owner ON user_invitations(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_activity_business_owner ON user_activity(business_owner_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

-- Enable RLS
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_users
CREATE POLICY "Users can view business users for their business" ON business_users
  FOR SELECT USING (
    business_owner_id = auth.uid() OR 
    user_id = auth.uid()
  );

CREATE POLICY "Business owners can manage their business users" ON business_users
  FOR ALL USING (business_owner_id = auth.uid());

-- RLS Policies for user_invitations
CREATE POLICY "Business owners can manage their invitations" ON user_invitations
  FOR ALL USING (business_owner_id = auth.uid());

-- RLS Policies for user_activity
CREATE POLICY "Users can view activity for their business" ON user_activity
  FOR SELECT USING (
    business_owner_id = auth.uid() OR 
    user_id = auth.uid()
  );

CREATE POLICY "System can insert activity logs" ON user_activity
  FOR INSERT WITH CHECK (true);

-- Function to automatically create business owner record
CREATE OR REPLACE FUNCTION create_business_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the user as owner of their own business
  INSERT INTO business_users (business_owner_id, user_id, role_id, status, joined_at)
  SELECT 
    NEW.id,
    NEW.id,
    r.id,
    'active',
    NOW()
  FROM roles r
  WHERE r.name = 'owner'
  ON CONFLICT (business_owner_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create business owner record on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_create_business_owner ON auth.users;
CREATE TRIGGER on_auth_user_created_create_business_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_business_owner();

-- Function to update last_login
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE business_users 
  SET last_login = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_login on auth
DROP TRIGGER IF EXISTS on_auth_user_login_update_last_login ON auth.users;
CREATE TRIGGER on_auth_user_login_update_last_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_user_last_login();

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_business_owner_id UUID,
  p_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO user_activity (
    business_owner_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    p_business_owner_id,
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_users_updated_at ON business_users;
CREATE TRIGGER update_business_users_updated_at
  BEFORE UPDATE ON business_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_invitations_updated_at ON user_invitations;
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
