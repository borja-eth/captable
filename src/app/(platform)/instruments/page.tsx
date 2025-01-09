import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { InstrumentList } from "@/components/instruments/instrument-list";
import { InstrumentCreateButton } from "@/components/instruments/instrument-create-button";
import { Separator } from "@roxom-markets/spark-ui";

interface InstrumentsPageProps {
    searchParams: {
        companyId?: string;
    };
}

const InstrumentsPage = async ({ searchParams }: InstrumentsPageProps) => {
    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Instruments
                    </h1>
                    <div className="text-muted-foreground">
                        Manage your company&apos;s instruments
                    </div>
                </div>
                <InstrumentCreateButton companyId={searchParams.companyId} />
            </div>
            <Separator className="my-6" />
            <InstrumentList />
        </div>
    );
};

export default withPermissionPage(InstrumentsPage, {
    permissions: [Permissions.INSTRUMENT_READ],
});
