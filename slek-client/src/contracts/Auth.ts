export interface ApiToken {
  type: 'bearer'
  token: string
  expires_at?: string
  expires_in?: number
}

export interface RegisterData {
  nickName:string
  name:string
  surname:string
  email: string
  password: string
  passwordConfirmation: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember: boolean
}

export interface User {
  nickName:string
  name:string
  surname:string
  id: number
  email: string
  createdAt: string,
  updatedAt: string
}
