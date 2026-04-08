// Supabase database types
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/database.ts

export type UserRole = 'customer' | 'admin'
export type ProductCategory = 'print' | 'canvas' | 'bundle' | 'frame'
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'review' | 'completed' | 'cancelled'
export type PaymentStatus = 'NOT_PAID' | 'PARTIALLY_PAID' | 'FULLY_PAID'
export type DeliveryLocation = 'port_harcourt' | 'rivers_state' | 'outside_rivers'
export type ArtworkType = 'custom_artwork' | 'photo_enlargement'
export type OrderItemType = 'artwork' | 'store_product'
export type WriteUpType = 'custom_message' | 'occasion'
export type PaymentType = 'full' | 'partial'
export type ReceiptStatus = 'pending' | 'verified' | 'rejected'
export type UploadType = 'artwork_reference' | 'payment_receipt'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          phone?: string | null
          role?: UserRole
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          original_price: number | null
          category: ProductCategory
          badge: string | null
          in_stock: boolean
          featured: boolean
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          original_price?: number | null
          category: ProductCategory
          badge?: string | null
          in_stock?: boolean
          featured?: boolean
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          price?: number
          original_price?: number | null
          category?: ProductCategory
          badge?: string | null
          in_stock?: boolean
          featured?: boolean
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: OrderStatus
          payment_status: PaymentStatus
          delivery_location: DeliveryLocation
          delivery_address: string
          delivery_bus_stop: string
          delivery_fee: number
          subtotal: number
          total_amount: number
          amount_paid: number
          amount_remaining: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          status?: OrderStatus
          payment_status?: PaymentStatus
          delivery_location: DeliveryLocation
          delivery_address: string
          delivery_bus_stop: string
          delivery_fee: number
          subtotal: number
          total_amount: number
          amount_paid?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: OrderStatus
          payment_status?: PaymentStatus
          delivery_address?: string
          delivery_bus_stop?: string
          delivery_fee?: number
          subtotal?: number
          total_amount?: number
          amount_paid?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          item_type: OrderItemType
          artwork_type: ArtworkType | null
          size_label: string | null
          width_inches: number | null
          height_inches: number | null
          area_sqin: number | null
          canvas_option: string | null
          frame_option: string | null
          glass_option: string | null
          write_up_type: WriteUpType | null
          write_up_content: string | null
          product_id: string | null
          quantity: number
          base_price: number
          canvas_price: number
          frame_price: number
          glass_price: number
          item_subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          item_type: OrderItemType
          artwork_type?: ArtworkType | null
          size_label?: string | null
          width_inches?: number | null
          height_inches?: number | null
          area_sqin?: number | null
          canvas_option?: string | null
          frame_option?: string | null
          glass_option?: string | null
          write_up_type?: WriteUpType | null
          write_up_content?: string | null
          product_id?: string | null
          quantity?: number
          base_price?: number
          canvas_price?: number
          frame_price?: number
          glass_price?: number
          item_subtotal: number
          created_at?: string
        }
        Update: {
          quantity?: number
          item_subtotal?: number
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          order_id: string
          user_id: string
          amount: number
          payment_type: PaymentType
          receipt_url: string
          status: ReceiptStatus
          verified_by: string | null
          verified_at: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          amount: number
          payment_type: PaymentType
          receipt_url: string
          status?: ReceiptStatus
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          status?: ReceiptStatus
          verified_by?: string | null
          verified_at?: string | null
          rejection_reason?: string | null
        }
        Relationships: []
      }
      uploads: {
        Row: {
          id: string
          user_id: string
          order_item_id: string | null
          file_name: string
          storage_path: string
          file_url: string
          file_type: UploadType
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_item_id?: string | null
          file_name: string
          storage_path: string
          file_url: string
          file_type: UploadType
          file_size: number
          created_at?: string
        }
        Update: {
          file_url?: string
          order_item_id?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      auth_user_id: {
        Args: Record<string, never>
        Returns: string
      }
      auth_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      product_category: ProductCategory
      order_status: OrderStatus
      payment_status: PaymentStatus
      delivery_location: DeliveryLocation
      artwork_type: ArtworkType
      order_item_type: OrderItemType
      write_up_type: WriteUpType
      payment_type: PaymentType
      receipt_status: ReceiptStatus
      upload_type: UploadType
    }
    CompositeTypes: Record<string, never>
  }
}
