import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { InvestorList } from "@/components/investors/investor-list";
import { InvestorCreateButton } from "@/components/investors/investor-create-button";
import { Separator } from "@roxom-markets/spark-ui";

const InvestorsPage = () => {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Investors
                    </h1>
                    <div className="text-muted-foreground">
                        Manage your company&apos;s investors
                    </div>
                </div>
                <InvestorCreateButton />
            </div>
            <Separator className="my-6" />
            <InvestorList />
        </div>
    );
};

export default withPermissionPage(InvestorsPage, {
    permissions: [Permissions.INVESTOR_LIST],
});
