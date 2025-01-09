import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { listRoundsByCompanyAction } from "@/lib/actions/round-actions";
import { RoundList } from "@/components/rounds/round-list";
import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";

interface RoundsPageProps {
    params: {
        companyId: string;
    };
}

const RoundsPage = async ({ params }: RoundsPageProps) => {
    const result = await listRoundsByCompanyAction({
        companyId: params.companyId,
    });

    if (!result || !result.data) {
        throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    return (
        <div className="flex flex-col gap-8">
            <RoundList />
        </div>
    );
};

export default withPermissionPage(RoundsPage, {
    permissions: [Permissions.ROUND_LIST],
});
