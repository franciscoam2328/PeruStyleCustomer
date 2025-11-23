-- 1. Add new columns to 'orders' table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS message text,
ADD COLUMN IF NOT EXISTS estimated_date timestamp with time zone;

-- 2. Create 'order_updates' table for the progress feed (Avances)
CREATE TABLE IF NOT EXISTS public.order_updates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  maker_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text,
  image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for order_updates
ALTER TABLE public.order_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view updates for their orders"
  ON public.order_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_updates.order_id
      AND (orders.client_id = auth.uid() OR orders.maker_id = auth.uid())
    )
  );

CREATE POLICY "Makers can insert updates for their orders"
  ON public.order_updates FOR INSERT
  WITH CHECK (
    auth.uid() = maker_id
  );

-- 3. Create 'reviews' table for ratings
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) NOT NULL,
  client_id uuid REFERENCES public.profiles(id) NOT NULL,
  maker_id uuid REFERENCES public.profiles(id) NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews for their orders"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = client_id
  );
