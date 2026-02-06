import type { Role } from "@prisma/client";

const ROLE_ORDER: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  STAFF: 1
};

export function hasRole(required: Role, actual: Role) {
  return ROLE_ORDER[actual] >= ROLE_ORDER[required];
}
