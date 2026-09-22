export type UserRole = "alumni" | "student" | "admin" | "super_admin";

export function getDashboardRoute(role?: string | null): string {
  switch (role) {
    case "alumni":
      return "/dashboard";
    case "student":
      return "/student";
    case "admin":
      return "/faculty";
    case "super_admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}

export function isManagementRole(role?: string | null): boolean {
  return role === "admin" || role === "super_admin";
}