import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { Separator } from "@roxom-markets/spark-ui";
import { CapTableView } from "@/components/captable/captable-view";

interface CapTablePageProps {
  searchParams: {
    companyId?: string;
  };
}

const CapTablePage = async ({ searchParams }: CapTablePageProps) => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cap Table</h1>
          <p className="text-muted-foreground">
            View and analyze your company&apos;s capitalization table
          </p>
        </div>
      </div>
      <Separator className="my-6" />
      <CapTableView companyId={searchParams.companyId} />
    </div>
  );
};

export default withPermissionPage(CapTablePage, {
  permissions: [Permissions.COMPANY_READ, Permissions.INSTRUMENT_READ, Permissions.ROUND_READ],
}); 