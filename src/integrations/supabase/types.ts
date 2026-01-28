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
      academic_calendar: {
        Row: {
          affects_all_classes: boolean | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_type: string
          id: string
          is_active: boolean | null
          is_holiday: boolean | null
          specific_class_ids: string[] | null
          start_date: string
          title: string
          title_arabic: string | null
        }
        Insert: {
          affects_all_classes?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_holiday?: boolean | null
          specific_class_ids?: string[] | null
          start_date: string
          title: string
          title_arabic?: string | null
        }
        Update: {
          affects_all_classes?: boolean | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_holiday?: boolean | null
          specific_class_ids?: string[] | null
          start_date?: string
          title?: string
          title_arabic?: string | null
        }
        Relationships: []
      }
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
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          link_text: string | null
          link_url: string | null
          message: string
          start_date: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          message: string
          start_date?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          link_text?: string | null
          link_url?: string | null
          message?: string
          start_date?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          name_arabic: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          name_arabic?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_arabic?: string | null
        }
        Relationships: []
      }
      book_issues: {
        Row: {
          book_id: string
          borrower_type: string
          created_at: string
          due_date: string
          fine_amount: number | null
          fine_paid: boolean | null
          id: string
          issue_date: string
          issue_id: string
          issued_by: string | null
          notes: string | null
          return_date: string | null
          returned_to: string | null
          status: string
          student_id: string | null
          teacher_id: string | null
        }
        Insert: {
          book_id: string
          borrower_type?: string
          created_at?: string
          due_date: string
          fine_amount?: number | null
          fine_paid?: boolean | null
          id?: string
          issue_date?: string
          issue_id: string
          issued_by?: string | null
          notes?: string | null
          return_date?: string | null
          returned_to?: string | null
          status?: string
          student_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          book_id?: string
          borrower_type?: string
          created_at?: string
          due_date?: string
          fine_amount?: number | null
          fine_paid?: boolean | null
          id?: string
          issue_date?: string
          issue_id?: string
          issued_by?: string | null
          notes?: string | null
          return_date?: string | null
          returned_to?: string | null
          status?: string
          student_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_issues_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_issues_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_issues_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          author_arabic: string | null
          available_copies: number | null
          book_id: string
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          edition: string | null
          id: string
          is_active: boolean | null
          is_reference_only: boolean | null
          isbn: string | null
          language: string | null
          publisher: string | null
          shelf_location: string | null
          title: string
          title_arabic: string | null
          total_copies: number | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          author_arabic?: string | null
          available_copies?: number | null
          book_id: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          id?: string
          is_active?: boolean | null
          is_reference_only?: boolean | null
          isbn?: string | null
          language?: string | null
          publisher?: string | null
          shelf_location?: string | null
          title: string
          title_arabic?: string | null
          total_copies?: number | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          author_arabic?: string | null
          available_copies?: number | null
          book_id?: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition?: string | null
          id?: string
          is_active?: boolean | null
          is_reference_only?: boolean | null
          isbn?: string | null
          language?: string | null
          publisher?: string | null
          shelf_location?: string | null
          title?: string
          title_arabic?: string | null
          total_copies?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "book_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          background_image_url: string | null
          content_template: string
          created_at: string
          footer_text: string | null
          header_text: string | null
          id: string
          is_active: boolean | null
          name: string
          template_type: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          content_template: string
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_type: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          content_template?: string
          created_at?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      class_schedule: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          room_number: string | null
          start_time: string
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          room_number?: string | null
          start_time: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          room_number?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedule_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_schedule_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      class_subjects: {
        Row: {
          books_required: string[] | null
          class_id: string
          created_at: string
          id: string
          is_mandatory: boolean | null
          subject_id: string
          syllabus_content: string | null
          teacher_id: string | null
          weekly_periods: number | null
        }
        Insert: {
          books_required?: string[] | null
          class_id: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          subject_id: string
          syllabus_content?: string | null
          teacher_id?: string | null
          weekly_periods?: number | null
        }
        Update: {
          books_required?: string[] | null
          class_id?: string
          created_at?: string
          id?: string
          is_mandatory?: boolean | null
          subject_id?: string
          syllabus_content?: string | null
          teacher_id?: string | null
          weekly_periods?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
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
      course_enrollments: {
        Row: {
          course_id: string | null
          enrolled_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_watched_lesson_id: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          progress_percentage: number | null
          user_email: string
          user_name: string | null
          user_phone: string | null
        }
        Insert: {
          course_id?: string | null
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_watched_lesson_id?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          progress_percentage?: number | null
          user_email: string
          user_name?: string | null
          user_phone?: string | null
        }
        Update: {
          course_id?: string | null
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_watched_lesson_id?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          progress_percentage?: number | null
          user_email?: string
          user_name?: string | null
          user_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_last_watched_lesson_id_fkey"
            columns: ["last_watched_lesson_id"]
            isOneToOne: false
            referencedRelation: "online_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          department: string | null
          description: string | null
          difficulty_level: string | null
          enrollment_count: number | null
          id: string
          instructor_id: string | null
          is_free: boolean | null
          is_published: boolean | null
          price: number | null
          rating: number | null
          thumbnail_url: string | null
          title: string
          title_arabic: string | null
          total_duration_minutes: number | null
          total_lessons: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          description?: string | null
          difficulty_level?: string | null
          enrollment_count?: number | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean | null
          is_published?: boolean | null
          price?: number | null
          rating?: number | null
          thumbnail_url?: string | null
          title: string
          title_arabic?: string | null
          total_duration_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          description?: string | null
          difficulty_level?: string | null
          enrollment_count?: number | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean | null
          is_published?: boolean | null
          price?: number | null
          rating?: number | null
          thumbnail_url?: string | null
          title?: string
          title_arabic?: string | null
          total_duration_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          name_arabic: string | null
          name_bengali: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          name_arabic?: string | null
          name_bengali: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_arabic?: string | null
          name_bengali?: string
          updated_at?: string
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
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_image_url: string | null
          chief_guest: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          registration_link: string | null
          special_guests: string[] | null
          title: string
          title_arabic: string | null
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          chief_guest?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          registration_link?: string | null
          special_guests?: string[] | null
          title: string
          title_arabic?: string | null
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          chief_guest?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          registration_link?: string | null
          special_guests?: string[] | null
          title?: string
          title_arabic?: string | null
          updated_at?: string
        }
        Relationships: []
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
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
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
      hostel_buildings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          name_arabic: string | null
          total_rooms: number | null
          warden_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_arabic?: string | null
          total_rooms?: number | null
          warden_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_arabic?: string | null
          total_rooms?: number | null
          warden_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_buildings_warden_id_fkey"
            columns: ["warden_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_buildings_warden_id_fkey"
            columns: ["warden_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_rooms: {
        Row: {
          amenities: string[] | null
          building_id: string
          capacity: number
          created_at: string
          current_occupancy: number | null
          floor_number: number | null
          id: string
          is_active: boolean | null
          monthly_rent: number | null
          room_number: string
          room_type: string | null
        }
        Insert: {
          amenities?: string[] | null
          building_id: string
          capacity?: number
          created_at?: string
          current_occupancy?: number | null
          floor_number?: number | null
          id?: string
          is_active?: boolean | null
          monthly_rent?: number | null
          room_number: string
          room_type?: string | null
        }
        Update: {
          amenities?: string[] | null
          building_id?: string
          capacity?: number
          created_at?: string
          current_occupancy?: number | null
          floor_number?: number | null
          id?: string
          is_active?: boolean | null
          monthly_rent?: number | null
          room_number?: string
          room_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "hostel_buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_settings: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          established_year: number | null
          facebook_url: string | null
          favicon_url: string | null
          id: string
          logo_url: string | null
          motto: string | null
          name: string
          name_english: string | null
          off_day: string | null
          phone: string | null
          principal_name: string | null
          registration_number: string | null
          system_language: string | null
          updated_at: string
          website: string | null
          whatsapp_number: string | null
          working_hours: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          facebook_url?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          motto?: string | null
          name?: string
          name_english?: string | null
          off_day?: string | null
          phone?: string | null
          principal_name?: string | null
          registration_number?: string | null
          system_language?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_number?: string | null
          working_hours?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          established_year?: number | null
          facebook_url?: string | null
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          motto?: string | null
          name?: string
          name_english?: string | null
          off_day?: string | null
          phone?: string | null
          principal_name?: string | null
          registration_number?: string | null
          system_language?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_number?: string | null
          working_hours?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      issued_certificates: {
        Row: {
          certificate_number: string
          certificate_type: string
          created_at: string
          id: string
          is_revoked: boolean | null
          issue_date: string
          issued_by: string | null
          remarks: string | null
          student_id: string
          template_id: string | null
          valid_until: string | null
        }
        Insert: {
          certificate_number: string
          certificate_type: string
          created_at?: string
          id?: string
          is_revoked?: boolean | null
          issue_date?: string
          issued_by?: string | null
          remarks?: string | null
          student_id: string
          template_id?: string | null
          valid_until?: string | null
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          created_at?: string
          id?: string
          is_revoked?: boolean | null
          issue_date?: string
          issued_by?: string | null
          remarks?: string | null
          student_id?: string
          template_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issued_certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      jamiyat_categories: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_arabic: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_arabic?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_arabic?: string | null
        }
        Relationships: []
      }
      jamiyat_settings: {
        Row: {
          auto_disable_days: number | null
          id: string
          is_enabled: boolean | null
          last_updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auto_disable_days?: number | null
          id?: string
          is_enabled?: boolean | null
          last_updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auto_disable_days?: number | null
          id?: string
          is_enabled?: boolean | null
          last_updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      leave_applications: {
        Row: {
          applicant_type: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          leave_type_id: string | null
          reason: string
          rejection_reason: string | null
          start_date: string
          status: string
          teacher_id: string | null
          total_days: number
        }
        Insert: {
          applicant_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          leave_type_id?: string | null
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: string
          teacher_id?: string | null
          total_days: number
        }
        Update: {
          applicant_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          leave_type_id?: string | null
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: string
          teacher_id?: string | null
          total_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_applications_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_applications_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_applications_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          is_paid: boolean | null
          max_days_per_year: number | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_days_per_year?: number | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_paid?: boolean | null
          max_days_per_year?: number | null
          name?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          created_at: string
          enrollment_id: string | null
          id: string
          is_completed: boolean | null
          last_watched_at: string | null
          lesson_id: string | null
          watched_percentage: number | null
        }
        Insert: {
          created_at?: string
          enrollment_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id?: string | null
          watched_percentage?: number | null
        }
        Update: {
          created_at?: string
          enrollment_id?: string | null
          id?: string
          is_completed?: boolean | null
          last_watched_at?: string | null
          lesson_id?: string | null
          watched_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "online_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_schedule: {
        Row: {
          breakfast: string | null
          created_at: string | null
          day_index: number
          day_name: string
          dinner: string | null
          id: string
          is_active: boolean | null
          lunch: string | null
          updated_at: string | null
        }
        Insert: {
          breakfast?: string | null
          created_at?: string | null
          day_index: number
          day_name: string
          dinner?: string | null
          id?: string
          is_active?: boolean | null
          lunch?: string | null
          updated_at?: string | null
        }
        Update: {
          breakfast?: string | null
          created_at?: string | null
          day_index?: number
          day_name?: string
          dinner?: string | null
          id?: string
          is_active?: boolean | null
          lunch?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notable_alumni: {
        Row: {
          achievement: string | null
          created_at: string
          current_institution: string | null
          current_position: string
          display_order: number | null
          email: string | null
          full_name: string
          full_name_arabic: string | null
          graduation_year: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          phone: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          achievement?: string | null
          created_at?: string
          current_institution?: string | null
          current_position: string
          display_order?: number | null
          email?: string | null
          full_name: string
          full_name_arabic?: string | null
          graduation_year?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          achievement?: string | null
          created_at?: string
          current_institution?: string | null
          current_position?: string
          display_order?: number | null
          email?: string | null
          full_name?: string
          full_name_arabic?: string | null
          graduation_year?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
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
          course_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          is_premium: boolean | null
          is_recorded: boolean | null
          lesson_order: number | null
          meeting_link: string | null
          meeting_platform: string | null
          price: number | null
          recording_url: string | null
          scheduled_at: string
          status: string | null
          teacher_id: string | null
          thumbnail_url: string | null
          title: string
          video_type: string | null
          views_count: number | null
          youtube_url: string | null
        }
        Insert: {
          class_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          is_recorded?: boolean | null
          lesson_order?: number | null
          meeting_link?: string | null
          meeting_platform?: string | null
          price?: number | null
          recording_url?: string | null
          scheduled_at: string
          status?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title: string
          video_type?: string | null
          views_count?: number | null
          youtube_url?: string | null
        }
        Update: {
          class_id?: string | null
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          is_premium?: boolean | null
          is_recorded?: boolean | null
          lesson_order?: number | null
          meeting_link?: string | null
          meeting_platform?: string | null
          price?: number | null
          recording_url?: string | null
          scheduled_at?: string
          status?: string | null
          teacher_id?: string | null
          thumbnail_url?: string | null
          title?: string
          video_type?: string | null
          views_count?: number | null
          youtube_url?: string | null
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
            foreignKeyName: "online_classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
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
          logo_url: string | null
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
          logo_url?: string | null
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
          logo_url?: string | null
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
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          name_bengali: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_bengali: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_bengali?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      room_allocations: {
        Row: {
          allocated_by: string | null
          allocation_date: string
          bed_number: number | null
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          room_id: string
          status: string
          student_id: string
        }
        Insert: {
          allocated_by?: string | null
          allocation_date?: string
          bed_number?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          room_id: string
          status?: string
          student_id: string
        }
        Update: {
          allocated_by?: string | null
          allocation_date?: string
          bed_number?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          room_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
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
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
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
      subjects: {
        Row: {
          code: string | null
          created_at: string
          department: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          name_arabic: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_arabic?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_arabic?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "teacher_attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
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
          {
            foreignKeyName: "teacher_salaries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_titles: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          name_arabic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          name_arabic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_arabic?: string | null
          updated_at?: string
        }
        Relationships: []
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
          title_id: string | null
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
          title_id?: string | null
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
          title_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "teacher_titles"
            referencedColumns: ["id"]
          },
        ]
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
      weekly_jamiyat: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          student_id: string | null
          updated_at: string
          week_start_date: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          student_id?: string | null
          updated_at?: string
          week_start_date: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          student_id?: string | null
          updated_at?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_jamiyat_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "jamiyat_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_jamiyat_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "lillah_students_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_jamiyat_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_jamiyat_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      lillah_students_public: {
        Row: {
          class_department: string | null
          class_id: string | null
          class_name: string | null
          father_name: string | null
          full_name: string | null
          id: string | null
          is_orphan: boolean | null
          lillah_reason: string | null
          photo_url: string | null
          sponsor_id: string | null
          sponsor_name: string | null
          student_id: string | null
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
      payment_gateways_public: {
        Row: {
          additional_config: Json | null
          created_at: string | null
          display_name: string | null
          display_order: number | null
          gateway_type:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          id: string | null
          is_enabled: boolean | null
          logo_url: string | null
          merchant_id: string | null
          sandbox_mode: boolean | null
          updated_at: string | null
        }
        Insert: {
          additional_config?: Json | null
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          gateway_type?:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          id?: string | null
          is_enabled?: boolean | null
          logo_url?: string | null
          merchant_id?: string | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
        }
        Update: {
          additional_config?: Json | null
          created_at?: string | null
          display_name?: string | null
          display_order?: number | null
          gateway_type?:
            | Database["public"]["Enums"]["payment_gateway_type"]
            | null
          id?: string | null
          is_enabled?: boolean | null
          logo_url?: string | null
          merchant_id?: string | null
          sandbox_mode?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      students_public: {
        Row: {
          class_id: string | null
          full_name: string | null
          full_name_arabic: string | null
          id: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["student_status"] | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          full_name?: string | null
          full_name_arabic?: string | null
          id?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          full_name?: string | null
          full_name_arabic?: string | null
          id?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["student_status"] | null
          student_id?: string | null
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
      teachers_public: {
        Row: {
          full_name: string | null
          full_name_arabic: string | null
          id: string | null
          photo_url: string | null
          qualification: string | null
          specialization: string | null
          status: Database["public"]["Enums"]["teacher_status"] | null
          teacher_id: string | null
          title_id: string | null
        }
        Insert: {
          full_name?: string | null
          full_name_arabic?: string | null
          id?: string | null
          photo_url?: string | null
          qualification?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["teacher_status"] | null
          teacher_id?: string | null
          title_id?: string | null
        }
        Update: {
          full_name?: string | null
          full_name_arabic?: string | null
          id?: string | null
          photo_url?: string | null
          qualification?: string | null
          specialization?: string | null
          status?: Database["public"]["Enums"]["teacher_status"] | null
          teacher_id?: string | null
          title_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "teacher_titles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_donation_stats: {
        Args: never
        Returns: {
          completed_amount: number
          completed_count: number
          total_amount: number
          total_count: number
        }[]
      }
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
