import { SERVER_ERRORS, ServerError } from "@/lib/types/server-error";
import type { Company, CreateCompanyInput } from "@/lib/types/company-types";
import { companySchema } from "@/lib/schemas/company-schemas";
import {
  createCompanyQuery,
  deleteCompanyQuery,
  doesCompanyExistByRegistrationQuery,
  doesCompanyExistQuery,
  getCompanyByIdQuery,
  listCompaniesQuery,
  updateCompanyQuery,
} from "@/lib/queries/company-queries";
import type { DatabaseConnection } from "@/database";

/**
 * Lists all companies
 */
export const listCompanies = async (connection?: DatabaseConnection): Promise<Company[]> => {
  return await listCompaniesQuery(connection);
};

/**
 * Gets a company by ID
 */
export const getCompanyById = async ({
  id,
  connection,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Company> => {
  const company = await getCompanyByIdQuery({ id, connection });
  
  if (!company) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }

  return company;
};

/**
 * Creates a new company
 */
export const createCompany = async ({
  data,
  connection,
}: {
  data: CreateCompanyInput;
  connection?: DatabaseConnection;
}): Promise<Company> => {
  // Validate input data
  const validatedData = companySchema.parse(data);

  // Check if company with same registration number exists
  const exists = await doesCompanyExistByRegistrationQuery({
    registrationNumber: validatedData.registrationNumber,
    connection,
  });

      if (exists) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }

  return await createCompanyQuery({
    data: validatedData,
    connection,
  });
};

/**
 * Updates an existing company
 */
export const updateCompany = async ({
  id,
  data,
  connection,
}: {
  id: string;
  data: Partial<CreateCompanyInput>;
  connection?: DatabaseConnection;
}): Promise<Company> => {
  // Check if company exists
  const exists = await doesCompanyExistQuery({ id, connection });

  if (!exists) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }

  // Validate partial input data
  const validatedData = companySchema.partial().parse(data);

  // If registration number is being updated, check for uniqueness
  if (validatedData.registrationNumber) {
    const existingCompany = await doesCompanyExistByRegistrationQuery({
      registrationNumber: validatedData.registrationNumber,
      connection,
    });

    if (existingCompany) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }
  }

  return await updateCompanyQuery({
    id,
    data: validatedData,
    connection,
  });
};

/**
 * Deletes a company
 */
export const deleteCompany = async ({
  id,
  connection,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Company> => {
  // Check if company exists
  const exists = await doesCompanyExistQuery({ id, connection });

  if (!exists) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }

  return await deleteCompanyQuery({ id, connection });
}; 