import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

export async function assertJobAccess(params: {
  tenantId: string;
  userId: string;
  role: Role;
  jobId: string;
}) {
  if (params.role === "OWNER" || params.role === "ADMIN") {
    return true;
  }

  const assignment = await prisma.jobAssignment.findUnique({
    where: {
      tenantId_jobId_userId: {
        tenantId: params.tenantId,
        jobId: params.jobId,
        userId: params.userId
      }
    }
  });

  if (!assignment) {
    throw new Error("Job access denied");
  }

  return true;
}
