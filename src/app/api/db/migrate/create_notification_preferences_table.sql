-- Migration: create notification_preferences table
-- Issue #11: Notification preferences (opt-in/opt-out)

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  order_confirmation   BOOLEAN NOT NULL DEFAULT TRUE,
  payment_confirmation BOOLEAN NOT NULL DEFAULT TRUE,
  payment_reminder     BOOLEAN NOT NULL DEFAULT TRUE,
  order_status_update  BOOLEAN NOT NULL DEFAULT TRUE,
  welcome              BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users can only read/write their own row
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);
