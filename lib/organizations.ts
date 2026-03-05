import sql from "@/lib/db";

export interface Organization {
  id: number;
  name: string;
  meta_account_id: string;
  google_account_id: string;
  store_id: string;
  created_at: string;
}

export async function getOrganizations(): Promise<Organization[]> {
  const rows = await sql<Organization[]>`
    SELECT id, name, meta_account_id, google_account_id, store_id, created_at
    FROM organization
    ORDER BY id ASC
  `;
  return rows;
}
