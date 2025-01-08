import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import { listCompaniesAction } from "@/lib/actions/company-actions";
import { CompanyList } from "@/components/companies/company-list";
import { ServerError, SERVER_ERRORS } from "@/lib/types/server-error";

const CompaniesPage = async () => {
  const result = await listCompaniesAction();
  
  // Handle potential errors from the action
  if (!result || !result.data) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }

  return (
    <div className="flex flex-col gap-8">

      <CompanyList companies={result.data} />
    </div>
  );
};

export default withPermissionPage(CompaniesPage, {
  permissions: [Permissions.COMPANY_LIST]
}); 