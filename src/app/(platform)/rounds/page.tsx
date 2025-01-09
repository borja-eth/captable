import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { RoundList } from "@/components/rounds/round-list";
import { AddRoundModal } from "@/components/rounds/add-round-modal";

const RoundsPage = () => {
    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                    Funding Rounds
                </h1>
                <AddRoundModal />
            </div>
            <RoundList />
        </div>
    );
};

export default withPermissionPage(RoundsPage, {
    permissions: [Permissions.ROUND_LIST, Permissions.ROUND_CREATE],
});
