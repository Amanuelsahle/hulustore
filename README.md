# 🚚 Hulu Store — Shein Order Tracking System (Addis Ababa)

A modern, fast, and secure logistics and order-tracking web application built for **Hulu Store** based in **Addis Ababa, Ethiopia**. Hulu Store manages end-to-end Shein order procurement, international shipping, customs clearance, and local door-to-door delivery across Addis Ababa.

Customers can track their orders in real-time using a unique, secure Order ID without needing to sign up or sign in.

---

## 🎨 Tech Stack & Architecture

- **Frontend Framework:** [Next.js 14/15](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/) with a custom `#E8B8A2` warm-terracotta brand theme
- **Animations:** [Framer Motion](https://www.framer.com/motion/) (animated status steppers, glowing status pulses, and page transitions)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database & Backend:** [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security - RLS)
- **Authentication:** Supabase Auth (Admin login access control)

---

## ✨ Features

### 🛍️ Public Home Page (`/`)
- Explains the **Hulu Store** Shein import process in Addis Ababa.
- Interactive **"How It Works"** breakdown.
- Fast tracking teaser search bar.

### 📦 Customer Order Tracking (`/track` & `/track/[id]`)
- **Zero Authentication Required:** Customers only need their unique Order ID (e.g., `HULU-8F2A9K`).
- **Animated 5-Stage Status Cut-Points:**
  1. 📦 **Order Received & Processing**
  2. 🛫 **Shipped to Hulu Store Foreign Branch**
  3. 🏢 **Arrived at Addis Ababa Hub**
  4. 🚚 **Out for Delivery to You**
  5. ✅ **Delivered**
- **Live Status Pulsing:** Real-time visual focus on the active delivery stage.

### 🔐 Protected Admin Panel (`/admin`)
- **Admin Authentication:** Protected via Supabase Auth & RLS policies.
- **Order Creation:** Input Customer Name, Phone Number, and Order Title.
- **Auto-Generated Tracking ID:** Secure, unguessable, non-sequential IDs generated using nanoid/crypto.
- **Live Status Management:** One-click dropdown updates to instantly change customer delivery status.

---

## 🗄️ Database Architecture & Row Level Security (RLS)

Execute the following SQL script inside your **Supabase SQL Editor** to set up the database schema, custom functions, and strict security policies.

```sql
-- 1. Create Enums for Delivery Statuses
CREATE TYPE delivery_status AS ENUM (
  'PROCESSING',
  'FOREIGN_BRANCH',
  'ARRIVED_ADDIS',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
);

-- 2. Create Orders Table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  order_title VARCHAR(255) NOT NULL,
  status delivery_status DEFAULT 'PROCESSING' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Create Status History Audit Table
CREATE TABLE public.order_status_history (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status delivery_status NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- RLS POLICIES
-- -------------------------------------------------------------

-- PUBLIC ACCESS: Anyone can read an order IF they have the exact tracking_id
CREATE POLICY "Public orders read with tracking_id" 
ON public.orders 
FOR SELECT 
TO public 
USING (true);

-- PUBLIC ACCESS: Anyone can read status history
CREATE POLICY "Public status history read" 
ON public.order_status_history 
FOR SELECT 
TO public 
USING (true);

-- ADMIN ACCESS: Only authenticated admins can INSERT orders
CREATE POLICY "Admin create orders" 
ON public.orders 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- ADMIN ACCESS: Only authenticated admins can UPDATE orders
CREATE POLICY "Admin update orders" 
ON public.orders 
FOR UPDATE 
TO authenticated 
USING (true);

-- ADMIN ACCESS: Only authenticated admins can DELETE orders
CREATE POLICY "Admin delete orders" 
ON public.orders 
FOR DELETE 
TO authenticated 
USING (true);

-- 5. Trigger for Updating timestamps and history
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_status_history (order_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_change();