-- AI Conversation and Message Tables Migration
-- This migration creates the database tables for AI conversations and messages

-- Create AI Conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(100),
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    context TEXT,
    metadata JSONB,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_ai_conversations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_ai_conversations_type CHECK (type IN ('general', 'product_inquiry', 'order_support', 'recommendation', 'technical_support')),
    CONSTRAINT chk_ai_conversations_status CHECK (status IN ('active', 'archived', 'deleted'))
);

-- Create AI Messages table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    metadata JSONB,
    token_count INTEGER,
    model_used VARCHAR(50),
    response_time INTEGER,
    error_message TEXT,
    confidence_score FLOAT,
    safety_ratings JSONB,
    flagged BOOLEAN DEFAULT FALSE,
    sequence_number INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_ai_messages_conversation FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    CONSTRAINT chk_ai_messages_role CHECK (role IN ('user', 'assistant', 'system')),
    CONSTRAINT chk_ai_messages_status CHECK (status IN ('pending', 'sent', 'delivered', 'error', 'processing')),
    CONSTRAINT chk_ai_messages_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_status ON ai_conversations(status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_status ON ai_conversations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(updated_at);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_role ON ai_messages(role);
CREATE INDEX IF NOT EXISTS idx_ai_messages_status ON ai_messages(status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_sequence ON ai_messages(conversation_id, sequence_number);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to both tables
CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_messages_updated_at 
    BEFORE UPDATE ON ai_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE ai_conversations IS 'Stores AI conversation sessions between users and the AI assistant';
COMMENT ON TABLE ai_messages IS 'Stores individual messages within AI conversations';

COMMENT ON COLUMN ai_conversations.user_id IS 'Foreign key reference to the user who owns this conversation';
COMMENT ON COLUMN ai_conversations.title IS 'Human-readable title for the conversation';
COMMENT ON COLUMN ai_conversations.type IS 'Type of conversation for better context handling';
COMMENT ON COLUMN ai_conversations.status IS 'Current status of the conversation';
COMMENT ON COLUMN ai_conversations.context IS 'Additional context or metadata for the conversation';
COMMENT ON COLUMN ai_conversations.metadata IS 'Structured metadata for conversation context';
COMMENT ON COLUMN ai_conversations.message_count IS 'Total number of messages in this conversation';
COMMENT ON COLUMN ai_conversations.last_message_at IS 'Timestamp of the last message in this conversation';

COMMENT ON COLUMN ai_messages.conversation_id IS 'Foreign key reference to the conversation this message belongs to';
COMMENT ON COLUMN ai_messages.role IS 'Role of the message sender (user, assistant, system)';
COMMENT ON COLUMN ai_messages.content IS 'The actual message content';
COMMENT ON COLUMN ai_messages.status IS 'Current status of the message';
COMMENT ON COLUMN ai_messages.metadata IS 'Additional metadata for the message (tokens, model info, etc.)';
COMMENT ON COLUMN ai_messages.token_count IS 'Number of tokens in this message (for cost tracking)';
COMMENT ON COLUMN ai_messages.model_used IS 'AI model used to generate this message';
COMMENT ON COLUMN ai_messages.response_time IS 'Response time in milliseconds for AI-generated messages';
COMMENT ON COLUMN ai_messages.error_message IS 'Error message if message processing failed';
COMMENT ON COLUMN ai_messages.confidence_score IS 'Confidence score for AI-generated responses (0-1)';
COMMENT ON COLUMN ai_messages.safety_ratings IS 'Safety ratings and content filtering results';
COMMENT ON COLUMN ai_messages.flagged IS 'Whether this message was flagged by content filters';
COMMENT ON COLUMN ai_messages.sequence_number IS 'Sequential order of this message in the conversation';