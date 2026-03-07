export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string
					full_name: string | null
					avatar_url: string | null
					is_pro: boolean
					stripe_customer_id: string | null
					created_at: string
				}
				Insert: {
					id: string
					full_name?: string | null
					avatar_url?: string | null
					is_pro?: boolean
					stripe_customer_id?: string | null
					created_at?: string
				}
				Update: {
					id?: string
					full_name?: string | null
					avatar_url?: string | null
					is_pro?: boolean
					stripe_customer_id?: string | null
				}
			}
			cvs: {
				Row: {
					id: string
					user_id: string
					title: string
					template: string
					status: string
					created_at: string
					updated_at: string
				}
				Insert: {
					id?: string
					user_id: string
					title: string
					template?: string
					status?: string
					created_at?: string
					updated_at?: string
				}
				Update: {
					id?: string
					user_id?: string
					title?: string
					template?: string
					status?: string
					updated_at?: string
				}
			}
			cv_sections: {
				Row: {
					id: string
					cv_id: string
					type: string
					content: Json
					order_index: number
				}
				Insert: {
					id?: string
					cv_id: string
					type: string
					content: Json
					order_index?: number
				}
				Update: {
					id?: string
					cv_id?: string
					type?: string
					content?: Json
					order_index?: number
				}
			}
		}
		Views: Record<string, never>
		Functions: Record<string, never>
		Enums: Record<string, never>
	}
}
