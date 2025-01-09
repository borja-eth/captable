export const Routes = {
    HOME: "/home",
    AUTH: {
        LOGIN: "/login",
    },
    SETTINGS: {
        SECURITY: {
            INDEX: "/settings/security",
            USERS: {
                INDEX: "/settings/security/users",
            },
            ROLES: {
                INDEX: "/settings/security/roles",
                NEW: "/settings/security/roles/new",
                EDIT: (roleId: string) =>
                    `/settings/security/roles/${roleId}/edit`,
            },
            PERMISSIONS: {
                INDEX: "/settings/security/permissions",
            },
        },
    },
    COMPANIES: {
        INDEX: "/companies",
        NEW: "/companies/new",
        DETAIL: (id: string) => `/companies/${id}`,
        EDIT: (id: string) => `/companies/${id}/edit`,
        ROUNDS: {
            LIST: (companyId: string) => `/companies/${companyId}/rounds`,
            NEW: (companyId: string) => `/companies/${companyId}/rounds/new`,
            DETAIL: (companyId: string, roundId: string) =>
                `/companies/${companyId}/rounds/${roundId}`,
            EDIT: (companyId: string, roundId: string) =>
                `/companies/${companyId}/rounds/${roundId}/edit`,
        },
    },
} as const;
