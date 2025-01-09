import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { Separator } from "@roxom-markets/spark-ui";
import { ScenariosView } from "@/components/scenarios/scenarios-view";

interface ScenariosPageProps {
    searchParams: {
        companyId?: string;
    };
}

const ScenariosPage = async ({ searchParams }: ScenariosPageProps) => {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Scenarios
                    </h1>
                    <p className="text-muted-foreground">
                        Model and analyze different investment scenarios for your company
                    </p>
                </div>
            </div>
            <Separator className="my-6" />
            <ScenariosView companyId={searchParams.companyId} />
        </div>
    );
};

export default withPermissionPage(ScenariosPage, {
    permissions: [
        Permissions.SCENARIO_READ,
        Permissions.COMPANY_READ,
    ],
}); 