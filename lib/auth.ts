// Simple authentication utilities
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("adminAuth") === "true"
}

export const logout = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminAuth")
  }
}

export const requireAuth = (callback: () => void): void => {
  if (!isAuthenticated()) {
    window.location.href = "/admin/login"
    return
  }
  callback()
}
