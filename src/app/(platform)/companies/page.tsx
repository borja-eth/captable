import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { listCompaniesAction } from "@/lib/actions/company-actions";
import { CompanyList } from "@/components/companies/company-list";
import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";
import { AddCompanyModal } from "@/components/companies/add-company-modal";

const CompaniesPage = async () => {
    try {
        const result = await listCompaniesAction();

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
                        Companies
                    </h1>
                    <AddCompanyModal />
                </div>
                <CompanyList companies={result.data} />
            </div>
        );
    } catch (error) {
        console.error("Error loading companies:", error);
        throw error;
    }
};

export default withPermissionPage(CompaniesPage, {
    permissions: [Permissions.COMPANY_LIST, Permissions.COMPANY_CREATE],
});
