export type User = {
  id: string
  name: string
  email: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type AuthResponse = {
  user: User
  token: string
}
