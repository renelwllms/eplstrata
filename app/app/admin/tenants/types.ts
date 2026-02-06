export type CreateTenantState =
  | { status: "idle"; message?: string }
  | { status: "error"; message: string }
  | {
      status: "success";
      tenantId: string;
      tenantName: string;
      ownerEmail: string;
      ownerPassword: string;
      emailSent?: boolean;
      emailError?: string | null;
    };
