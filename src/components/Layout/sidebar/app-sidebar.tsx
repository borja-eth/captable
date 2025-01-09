"use client";

import Logo from "@/components/common/Brand/Logo";
import { NavMain } from "@/components/Layout/sidebar/nav-main";
import { NavUser } from "@/components/Layout/sidebar/nav-user";
import { cn } from "@/lib/utils/classnames";
import { Routes } from "@/routes";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from "@roxom-markets/spark-ui";
import { BookOpen, LineChart, Lock } from "lucide-react";
import Link from "next/link";
import * as React from "react";

// This is sample data.
const data = {
    platform: [
        {
            title: "Dashboards",
            url: "#",
            icon: LineChart,
            isActive: true,
            items: [
                {
                    title: "Home",
                    url: Routes.HOME,
                },
                {
                    title: "Companies",
                    url: Routes.COMPANIES.INDEX,
                },
                {
                    title: "Rounds",
                    url: "/rounds",
                },
                {
                    title: "Investors",
                    url: "/investors",
                },
                {
                    title: "Instruments",
                    url: "/instruments",
                },
                {
                    title: "Cap Table",
                    url: "/captable",
                },
                {
                    title: "Scenarios",
                    url: "/scenarios",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
            ],
        },
    ],
    settings: [
        {
            title: "Security",
            url: Routes.SETTINGS.SECURITY.INDEX,
            icon: Lock,
            items: [
                {
                    title: "Collaborators",
                    url: Routes.SETTINGS.SECURITY.USERS.INDEX,
                },
                {
                    title: "Roles",
                    url: Routes.SETTINGS.SECURITY.ROLES.INDEX,
                },
                {
                    title: "Permissions",
                    url: Routes.SETTINGS.SECURITY.PERMISSIONS.INDEX,
                },
            ],
        },
    ],
};

export const AppSidebar = ({
    ...props
}: React.ComponentProps<typeof Sidebar>) => {
    const { open } = useSidebar();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { collapsible, className, ...rest } = props;

    return (
        <Sidebar
            className={cn("hidden md:block border-border", className)}
            collapsible="icon"
            {...rest}
        >
            <SidebarHeader>
                <Link
                    className={cn(
                        open ? "h-8" : "size-8",
                        "flex flex-row items-center gap-1",
                    )}
                    href={Routes.HOME}
                >
                    <Logo className="h-7" />
                    <img
                        alt="Logo"
                        className={cn(
                            "dark:invert",
                            open ? "block" : "hidden",
                            "h-3.5",
                        )}
                        src="/logo-text.png"
                    />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.platform} title="Platform" />
                <NavMain items={data.settings} title="Settings" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};
