import Link from "next/link";
import Image from "next/image";
import { getOrganizations } from "@/lib/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart2 } from "lucide-react";

export default async function Home() {
  const orgs = await getOrganizations();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <Image src="/escalafy.png" alt="Escalafy" width={32} height={32} />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              Escalafy
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mt-6 mb-2">
            Reporting Dashboard
          </h1>
          <p className="text-muted-foreground mb-12">
            Select an organization to view its multi-channel performance report.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {orgs.map((org) => (
            <Link key={org.id} href={`/dashboard/${org.id}`} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2">
                      <BarChart2 className="w-5 h-5 text-primary" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{org.meta_account_id}</Badge>
                  <Badge variant="secondary">{org.google_account_id}</Badge>
                  <Badge variant="secondary">{org.store_id}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
