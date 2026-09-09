-- Add Razorpay order ID to registrations.

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT UNIQUE;

-- Existing Cashfree order IDs are intentionally not copied.
-- Existing registrations can remain pending.
-- A new Razorpay order will be created when checkout is started.