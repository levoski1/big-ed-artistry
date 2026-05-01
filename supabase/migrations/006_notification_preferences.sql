-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  order_confirmation   BOOLEAN NOT NULL DEFAULT true,
  payment_confirmation BOOLEAN NOT NULL DEFAULT true,
  payment_reminder     BOOLEAN NOT NULL DEFAULT true,
  order_status_update  BOOLEAN NOT NULL DEFAULT true,
  welcome              BOOLEAN NOT NULL DEFAULT true,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users can only read/write their own row
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
