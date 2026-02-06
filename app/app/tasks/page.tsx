import { prisma } from "../../../lib/prisma";
import { requireTenant } from "../../../lib/session";
import { getTenantBillingContext } from "../../../lib/billing-access";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { TaskCatalogManager } from "../../../components/app/tasks/task-catalog-manager";

export default async function TasksPage() {
  const user = await requireTenant();
  const billing = await getTenantBillingContext(user.tenantId);
  const hasAccess = billing.featureFlags.has("TASKS") || user.platformRole === "SUPER_ADMIN";

  const tasks = hasAccess
    ? await prisma.taskCatalog.findMany({
        where: { tenantId: user.tenantId },
        orderBy: { createdAt: "desc" }
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Tasks</p>
        <h1 className="font-display text-3xl">Task catalog</h1>
        <p className="text-sm text-ink-700">Manage the tasks available for time entries.</p>
      </div>

      {!hasAccess ? (
        <Card>
          <CardContent>
            <p className="text-sm text-ink-700">Tasks are not available on your current plan.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskCatalogManager
              initialTasks={tasks.map((task) => ({
                id: task.id,
                name: task.name,
                defaultBillableRate: task.defaultBillableRate ? Number(task.defaultBillableRate) : null,
                isActive: task.isActive
              }))}
              readOnly={billing.readOnly || user.role === "STAFF"}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
