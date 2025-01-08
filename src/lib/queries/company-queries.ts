import { eq } from "drizzle-orm";
import { db } from "@/database";
import { companies } from "@/database/schema";
import type { DatabaseConnection } from "@/database";
import type { Company } from "@/lib/types/company-types";

/**
 * Retrieves all companies from the database
 */
export const listCompaniesQuery = async (
  connection: DatabaseConnection = db
): Promise<Company[]> => {
  return await connection.query.companies.findMany({
    orderBy: (companies, { desc }) => [desc(companies.createdAt)],
  });
};

/**
 * Retrieves a company by its ID
 */
export const getCompanyByIdQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Company | null> => {
  const results = await connection.query.companies.findFirst({
    where: eq(companies.id, id),
  });

  return results ?? null;
};

/**
 * Creates a new company
 */
export const createCompanyQuery = async ({
  data,
  connection = db,
}: {
  data: Omit<Company, "id" | "createdAt" | "updatedAt">;
  connection?: DatabaseConnection;
}): Promise<Company> => {
  const [company] = await connection
    .insert(companies)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return company;
};

/**
 * Updates an existing company
 */
export const updateCompanyQuery = async ({
  id,
  data,
  connection = db,
}: {
  id: string;
  data: Partial<Omit<Company, "id" | "createdAt" | "updatedAt">>;
  connection?: DatabaseConnection;
}): Promise<Company> => {
  const [company] = await connection
    .update(companies)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(companies.id, id))
    .returning();

  return company;
};

/**
 * Deletes a company by its ID
 */
export const deleteCompanyQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<Company> => {
  const [company] = await connection
    .delete(companies)
    .where(eq(companies.id, id))
    .returning();

  return company;
};

/**
 * Checks if a company exists by ID
 */
export const doesCompanyExistQuery = async ({
  id,
  connection = db,
}: {
  id: string;
  connection?: DatabaseConnection;
}): Promise<boolean> => {
  const company = await connection.query.companies.findFirst({
    where: eq(companies.id, id),
    columns: {
      id: true,
    },
  });

  return !!company;
};

/**
 * Checks if a company exists by registration number
 */
export const doesCompanyExistByRegistrationQuery = async ({
  registrationNumber,
  connection = db,
}: {
  registrationNumber: string;
  connection?: DatabaseConnection;
}): Promise<boolean> => {
  const company = await connection.query.companies.findFirst({
    where: eq(companies.registrationNumber, registrationNumber),
    columns: {
      id: true,
    },
  });

  return !!company;
};
