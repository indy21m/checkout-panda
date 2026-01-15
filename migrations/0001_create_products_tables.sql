-- Products table with JSONB config
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  stripe_product_id TEXT,
  stripe_synced_at TIMESTAMPTZ,
  stripe_sync_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe prices tracking
CREATE TABLE IF NOT EXISTS stripe_prices (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tier_id TEXT NOT NULL,
  stripe_price_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_interval TEXT,
  recurring_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stripe_prices_product ON stripe_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_products_config ON products USING GIN (config);
