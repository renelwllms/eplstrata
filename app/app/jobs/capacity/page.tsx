import { getCapacityPayload, getDefaultRange } from "../../../../lib/capacity";
import { requireTenant } from "../../../../lib/session";
import CapacityView from "./capacity-view";

export default async function CapacityPage() {
  const user = await requireTenant();
  const range = getDefaultRange();
  const data = await getCapacityPayload(user.tenantId, range);

  return <CapacityView initialData={data} />;
}
