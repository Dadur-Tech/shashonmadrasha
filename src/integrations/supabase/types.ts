export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean | null
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean | null
          name: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean | null
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          admission_fee: number
          class_teacher_id: string | null
          created_at: string
          department: string
          id: string
          is_active: boolean | null
          monthly_fee: number
          name: string
          name_arabic: string | null
        }
        Insert: {
          admission_fee?: number
          class_teacher_id?: string | null
          created_at?: string
          department?: string
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          name: string
          name_arabic?: string | null
        }
        Update: {
          admission_fee?: number
          class_teacher_id?: string | null
          created_at?: string
          department?: string
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          name?: string
          name_arabic?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["donation_category"]
          created_at: string
          donation_id: string
          donor_address: string | null
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          is_anonymous: boolean | null
          is_recurring: boolean | null
          notes: string | null
          payment_gateway:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          payment_status: string
          receipt_sent: boolean | null
          sponsor_id: string | null
          student_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["donation_category"]
          created_at?: string
          donation_id: string
          donor_address?: string | null
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          payment_status?: string
          receipt_sent?: boolean | null
          sponsor_id?: string | null
          student_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["donation_category"]
          created_at?: string
          donation_id?: string
          donor_address?: string | null
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          payment_status?: string
          receipt_sent?: boolean | null
          sponsor_id?: string | null
          student_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          created_at: string
          entered_by: string | null
          exam_id: string
          full_marks: number
          grade: string | null
          id: string
          obtained_marks: number
          remarks: string | null
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string
          entered_by?: string | null
          exam_id: string
          full_marks?: number
          grade?: string | null
          id?: string
          obtained_marks?: number
          remarks?: string | null
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string
          entered_by?: string | null
          exam_id?: string
          full_marks?: number
          grade?: string | null
          id?: string
          obtained_marks?: number
          remarks?: string | null
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year_id: string | null
          created_at: string
          end_date: string | null
          exam_type: string
          id: string
          is_published: boolean | null
          name: string
          start_date: string | null
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string
          end_date?: string | null
          exam_type: string
          id?: string
          is_published?: boolean | null
          name: string
          start_date?: string | null
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string
          end_date?: string | null
          exam_type?: string
          id?: string
          is_published?: boolean | null
          name?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category_id: string | null
          created_at: string
          description: string | null
          expense_date: string
          expense_id: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_url: string | null
          recorded_by: string | null
          title: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_id: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          title: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string
          expense_id?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_types: {
        Row: {
          created_at: string
          default_amount: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_monthly: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          default_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_monthly?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          default_amount?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_monthly?: boolean | null
          name?: string
        }
        Relationships: []
      }
      institution_settings: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          established_year: number | null
          id: string
          logo_url: string | null
          name: string
          name_english: string | null
          phone: string | null
          principal_name: string | null
          registration_number: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          established_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          name_english?: string | null
          phone?: string | null
          principal_name?: string | null
          registration_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          established_year?: number | null
          id?: string
          logo_url?: string | null
          name?: string
          name_english?: string | null
          phone?: string | null
          principal_name?: string | null
          registration_number?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_read: boolean | null
          message: string
          target_type: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          target_type?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          target_type?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      online_classes: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_recorded: boolean | null
          meeting_link: string | null
          meeting_platform: string | null
          recording_url: string | null
          scheduled_at: string
          status: string | null
          teacher_id: string | null
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_recorded?: boolean | null
          meeting_link?: string | null
          meeting_platform?: string | null
          recording_url?: string | null
          scheduled_at: string
          status?: string | null
          teacher_id?: string | null
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_recorded?: boolean | null
          meeting_link?: string | null
          meeting_platform?: string | null
          recording_url?: string | null
          scheduled_at?: string
          status?: string | null
          teacher_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "online_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          additional_config: Json | null
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          created_at: string
          display_name: string
          display_order: number | null
          gateway_type: Database["public"]["Enums"]["payment_gateway_type"]
          id: string
          is_enabled: boolean
          merchant_id: string | null
          sandbox_mode: boolean | null
          updated_at: string
        }
        Insert: {
          additional_config?: Json | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string
          display_name: string
          display_order?: number | null
          gateway_type: Database["public"]["Enums"]["payment_gateway_type"]
          id?: string
          is_enabled?: boolean
          merchant_id?: string | null
          sandbox_mode?: boolean | null
          updated_at?: string
        }
        Update: {
          additional_config?: Json | null
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string
          display_name?: string
          display_order?: number | null
          gateway_type?: Database["public"]["Enums"]["payment_gateway_type"]
          id?: string
          is_enabled?: boolean
          merchant_id?: string | null
          sandbox_mode?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          gateway_transaction_id: string | null
          id: string
          notes: string | null
          payer_name: string | null
          payer_phone: string | null
          payment_date: string | null
          payment_gateway:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          payment_type: string
          reference_id: string | null
          status: string
          transaction_id: string
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          gateway_transaction_id?: string | null
          id?: string
          notes?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_date?: string | null
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          payment_type: string
          reference_id?: string | null
          status?: string
          transaction_id: string
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          gateway_transaction_id?: string | null
          id?: string
          notes?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          payment_date?: string | null
          payment_gateway?:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          payment_type?: string
          reference_id?: string | null
          status?: string
          transaction_id?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          address: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_anonymous: boolean | null
          notes: string | null
          phone: string
          students_sponsored: number | null
          total_donated: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          phone: string
          students_sponsored?: number | null
          total_donated?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_anonymous?: boolean | null
          notes?: string | null
          phone?: string
          students_sponsored?: number | null
          total_donated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      student_attendance: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          amount: number
          created_at: string
          discount: number | null
          due_amount: number | null
          due_date: string | null
          fee_id: string
          fee_type_id: string | null
          id: string
          month: number | null
          notes: string | null
          paid_amount: number | null
          status: Database["public"]["Enums"]["fee_status"]
          student_id: string
          updated_at: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          discount?: number | null
          due_amount?: number | null
          due_date?: string | null
          fee_id: string
          fee_type_id?: string | null
          id?: string
          month?: number | null
          notes?: string | null
          paid_amount?: number | null
          status?: Database["public"]["Enums"]["fee_status"]
          student_id: string
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          discount?: number | null
          due_amount?: number | null
          due_date?: string | null
          fee_id?: string
          fee_type_id?: string | null
          id?: string
          month?: number | null
          notes?: string | null
          paid_amount?: number | null
          status?: Database["public"]["Enums"]["fee_status"]
          student_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_fee_type_id_fkey"
            columns: ["fee_type_id"]
            isOneToOne: false
            referencedRelation: "fee_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_date: string
          blood_group: string | null
          class_id: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          father_name: string
          full_name: string
          full_name_arabic: string | null
          guardian_name: string | null
          guardian_phone: string
          guardian_relation: string | null
          id: string
          is_lillah: boolean | null
          is_orphan: boolean | null
          lillah_reason: string | null
          mother_name: string | null
          notes: string | null
          photo_url: string | null
          post_office: string | null
          previous_institution: string | null
          sponsor_id: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_id: string
          upazila: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string
          blood_group?: string | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          father_name: string
          full_name: string
          full_name_arabic?: string | null
          guardian_name?: string | null
          guardian_phone: string
          guardian_relation?: string | null
          id?: string
          is_lillah?: boolean | null
          is_orphan?: boolean | null
          lillah_reason?: string | null
          mother_name?: string | null
          notes?: string | null
          photo_url?: string | null
          post_office?: string | null
          previous_institution?: string | null
          sponsor_id?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id: string
          upazila?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string
          blood_group?: string | null
          class_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          father_name?: string
          full_name?: string
          full_name_arabic?: string | null
          guardian_name?: string | null
          guardian_phone?: string
          guardian_relation?: string | null
          id?: string
          is_lillah?: boolean | null
          is_orphan?: boolean | null
          lillah_reason?: string | null
          mother_name?: string | null
          notes?: string | null
          photo_url?: string | null
          post_office?: string | null
          previous_institution?: string | null
          sponsor_id?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_id?: string
          upazila?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          teacher_id: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          teacher_id: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_salaries: {
        Row: {
          base_salary: number
          bonus: number | null
          created_at: string
          deduction: number | null
          id: string
          month: number
          net_salary: number | null
          notes: string | null
          paid_amount: number | null
          paid_by: string | null
          payment_date: string | null
          payment_method: string | null
          salary_id: string
          status: Database["public"]["Enums"]["salary_status"]
          teacher_id: string
          year: number
        }
        Insert: {
          base_salary: number
          bonus?: number | null
          created_at?: string
          deduction?: number | null
          id?: string
          month: number
          net_salary?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_by?: string | null
          payment_date?: string | null
          payment_method?: string | null
          salary_id: string
          status?: Database["public"]["Enums"]["salary_status"]
          teacher_id: string
          year: number
        }
        Update: {
          base_salary?: number
          bonus?: number | null
          created_at?: string
          deduction?: number | null
          id?: string
          month?: number
          net_salary?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_by?: string | null
          payment_date?: string | null
          payment_method?: string | null
          salary_id?: string
          status?: Database["public"]["Enums"]["salary_status"]
          teacher_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "teacher_salaries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          father_name: string | null
          full_name: string
          full_name_arabic: string | null
          id: string
          joining_date: string
          mobile_banking_number: string | null
          monthly_salary: number
          nid_number: string | null
          notes: string | null
          phone: string
          photo_url: string | null
          qualification: string | null
          specialization: string | null
          status: Database["public"]["Enums"]["teacher_status"]
          teacher_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          father_name?: string | null
          full_name: string
          full_name_arabic?: string | null
          id?: string
          joining_date?: string
          mobile_banking_number?: string | null
          monthly_salary?: number
          nid_number?: string | null
          notes?: string | null
          phone: string
          photo_url?: string | null
          qualification?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["teacher_status"]
          teacher_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          father_name?: string | null
          full_name?: string
          full_name_arabic?: string | null
          id?: string
          joining_date?: string
          mobile_banking_number?: string | null
          monthly_salary?: number
          nid_number?: string | null
          notes?: string | null
          phone?: string
          photo_url?: string | null
          qualification?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["teacher_status"]
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "accountant" | "teacher" | "staff"
      attendance_status: "present" | "absent" | "late" | "leave" | "holiday"
      donation_category:
        | "lillah_boarding"
        | "orphan_support"
        | "madrasa_development"
        | "general"
        | "zakat"
        | "sadaqah"
        | "fitra"
      fee_status: "pending" | "partial" | "paid" | "waived" | "overdue"
      payment_gateway_type:
        | "bkash"
        | "nagad"
        | "rocket"
        | "sslcommerz"
        | "amarpay"
        | "upay"
        | "manual"
      salary_status: "pending" | "paid" | "partial" | "hold"
      student_status:
        | "active"
        | "inactive"
        | "graduated"
        | "transferred"
        | "lillah"
      teacher_status: "active" | "inactive" | "on_leave" | "resigned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "accountant", "teacher", "staff"],
      attendance_status: ["present", "absent", "late", "leave", "holiday"],
      donation_category: [
        "lillah_boarding",
        "orphan_support",
        "madrasa_development",
        "general",
        "zakat",
        "sadaqah",
        "fitra",
      ],
      fee_status: ["pending", "partial", "paid", "waived", "overdue"],
      payment_gateway_type: [
        "bkash",
        "nagad",
        "rocket",
        "sslcommerz",
        "amarpay",
        "upay",
        "manual",
      ],
      salary_status: ["pending", "paid", "partial", "hold"],
      student_status: [
        "active",
        "inactive",
        "graduated",
        "transferred",
        "lillah",
      ],
      teacher_status: ["active", "inactive", "on_leave", "resigned"],
    },
  },
} as const
