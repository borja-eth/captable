import "server-only";
import { RedirectType, redirect } from "next/navigation";

import { checkUserPermissions } from "@/lib/services/user-service";

import { Permissions } from "@/lib/types/permission-types";
import { Routes } from "@/routes";
import { getLoggedUser } from "@/lib/auth/auth";

type WithPermissionPageConfig = {
    unauthorizedPageUrl?: string;
    permissions: Permissions[];
    partialPermissions?: boolean;
};

type ASYNC_PAGE = (props: any) => Promise<JSX.Element>;

/**
 * A high order component to check permissions based on URL parameters
 */
export const withPermissionPage =
    (
        Component: ASYNC_PAGE | (() => JSX.Element),
        config: WithPermissionPageConfig,
    ): ((props: any) => Promise<JSX.Element | void>) =>
    async (props: any): Promise<JSX.Element | void> => {
        try {
            const { permissions, partialPermissions, unauthorizedPageUrl } =
                config;

            const kick = () =>
                redirect(
                    unauthorizedPageUrl || "/unauthorized",
                    RedirectType.replace,
                );
            // Aca va lo de return Component(props)
            const user = await getLoggedUser();

            if (!user?.id) {
                return kick();
            }

            if (permissions.length === 0) {
                return Component(props);
            }

            const permissionCheck = await checkUserPermissions(
                user.id,
                permissions,
            );

            const arrFn = partialPermissions ? "some" : "every";

            const hasPermission = Object.values(permissionCheck)[arrFn](
                (v) => v === true,
            );

            if (!hasPermission) {
                return kick();
            }

            return Component(props);
        } catch (e) {
            console.error(e);
            redirect(Routes.AUTH.LOGIN, RedirectType.replace);
        }
    };
