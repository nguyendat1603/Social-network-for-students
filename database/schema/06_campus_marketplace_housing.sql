-- ============================================================================
-- MODULE 6: CAMPUS MARKETPLACE & HOUSING (CHỢ SINH VIÊN & NHÀ TRỌ)
-- Target Database: Supabase PostgreSQL 17
-- Reference: docs/mvp-specification.md (Module 6)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_category') THEN
        CREATE TYPE public.marketplace_category AS ENUM (
            'TEXTBOOK',
            'CALCULATOR',
            'HARDWARE_KIT',
            'DORM_ITEM',
            'OTHER'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_condition') THEN
        CREATE TYPE public.item_condition AS ENUM (
            'NEW_100',
            'LIKE_NEW_90',
            'GOOD_80',
            'SLIGHTLY_DAMAGED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'marketplace_item_status') THEN
        CREATE TYPE public.marketplace_item_status AS ENUM (
            'AVAILABLE',
            'RESERVED',
            'SOLD'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'housing_listing_type') THEN
        CREATE TYPE public.housing_listing_type AS ENUM (
            'ROOM_FOR_RENT',
            'ROOMMATE_WANTED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sleep_schedule_habit') THEN
        CREATE TYPE public.sleep_schedule_habit AS ENUM (
            'EARLY_BIRD',
            'NIGHT_OWL',
            'FLEXIBLE'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_pref') THEN
        CREATE TYPE public.gender_pref AS ENUM ('MALE', 'FEMALE', 'ANY');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'housing_status') THEN
        CREATE TYPE public.housing_status AS ENUM ('OPEN', 'CLOSED');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category public.marketplace_category NOT NULL DEFAULT 'TEXTBOOK',
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price_vnd INTEGER NOT NULL DEFAULT 0 CHECK (price_vnd >= 0),
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    condition public.item_condition NOT NULL DEFAULT 'LIKE_NEW_90',
    pickup_location VARCHAR(200) NOT NULL DEFAULT 'Khuôn viên trường',
    status public.marketplace_item_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON public.marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_course_id ON public.marketplace_items(course_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_filter ON public.marketplace_items(status, category, price_vnd);

CREATE TABLE IF NOT EXISTS public.marketplace_item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_item_images_item_id ON public.marketplace_item_images(item_id);

CREATE TABLE IF NOT EXISTS public.housing_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poster_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_type public.housing_listing_type NOT NULL DEFAULT 'ROOMMATE_WANTED',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    address_area VARCHAR(200) NOT NULL,
    distance_to_campus_km NUMERIC(4,1) NOT NULL DEFAULT 1.0 CHECK (distance_to_campus_km >= 0),
    monthly_rent_vnd INTEGER NOT NULL CHECK (monthly_rent_vnd >= 0),
    max_budget_vnd INTEGER NOT NULL CHECK (max_budget_vnd >= 0),
    electricity_water_note VARCHAR(200),
    sleep_schedule public.sleep_schedule_habit NOT NULL DEFAULT 'FLEXIBLE',
    smoking_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    cooking_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    gender_preference public.gender_pref NOT NULL DEFAULT 'ANY',
    status public.housing_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_housing_listings_poster_id ON public.housing_listings(poster_id);
CREATE INDEX IF NOT EXISTS idx_housing_listings_filter ON public.housing_listings(status, listing_type, max_budget_vnd);

CREATE OR REPLACE TRIGGER trg_marketplace_items_updated_at
BEFORE UPDATE ON public.marketplace_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_housing_listings_updated_at
BEFORE UPDATE ON public.housing_listings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_listings ENABLE ROW LEVEL SECURITY;
