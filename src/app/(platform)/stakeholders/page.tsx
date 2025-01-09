import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { listStakeholdersAction } from "@/lib/actions/stakeholder-actions";
import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";
import { StakeholderList } from "@/components/stakeholders/stakeholder-list";
import { AddStakeholderModal } from "@/components/stakeholders/add-stakeholder-modal";

const StakeholdersPage = async () => {
    try {
        const result = await listStakeholdersAction();

        if (!result) {
            throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
        }

        if (result.serverError) {
            throw new ServerError(result.serverError);
        }

        if (!result.data) {
            throw new ServerError(SERVER_ERRORS.DATABASE_ERROR);
        }

        return (
            <div className="container mx-auto py-8 space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Stakeholders
                    </h1>
                    <AddStakeholderModal />
                </div>
                <StakeholderList stakeholders={result.data} />
            </div>
        );
    } catch (error) {
        console.error("Error loading stakeholders:", error);
        throw error;
    }
};

export default withPermissionPage(StakeholdersPage, {
    permissions: [Permissions.STAKEHOLDER_LIST, Permissions.STAKEHOLDER_CREATE],
});
