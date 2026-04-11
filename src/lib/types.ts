export interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  department: string
  employeeId: string
  avatarUrl?: string
}

export interface LcrRecord {
  doc_id: number
  type_id: number
  typeCode: string   // 'BIRTH' | 'DEATH' | 'MARRCERT' | 'MARRLIC'
  typeName: string
  status: string
  upload_date: string
  form_data: Record<string, string>
  name: string       // derived from form_data
}

export interface ProcessResult {
  status: string
  form_class: string
  fields: Record<string, string>
  message?: string
  confidence?: Record<string, number>
}

export type FormClass = '1A' | '2A' | '3A' | '90'
export type NotificationType = 'success' | 'error' | 'info'

export interface Notification {
  message: string
  type: NotificationType
}
