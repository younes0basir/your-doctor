-- Create temp_tokens table for password reset functionality
CREATE TABLE IF NOT EXISTS temp_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_type VARCHAR(50) NOT NULL, -- 'patient', 'doctor', 'assistant', 'admin'
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on token for faster lookups
CREATE INDEX IF NOT EXISTS idx_temp_tokens_token ON temp_tokens(token);
CREATE INDEX IF NOT EXISTS idx_temp_tokens_user ON temp_tokens(user_type, user_id);
