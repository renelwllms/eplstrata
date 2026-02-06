import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { ClientForm } from "../../../../components/app/forms/client-form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink-700">Clients</p>
        <h1 className="font-display text-3xl">New client</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm />
        </CardContent>
      </Card>
    </div>
  );
}
