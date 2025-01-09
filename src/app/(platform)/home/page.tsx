import { withPermissionPage } from "@/lib/middlewares/withPermissionPage";
import { Permissions } from "@/lib/types/permission-types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
} from "@roxom-markets/spark-ui";
import Link from "next/link";
import {
    Users,
    Building2,
    CircleDollarSign,
    Briefcase,
    BarChart3,
    Settings,
} from "lucide-react";
import { DashboardStats } from "./components/dashboard-stats";

interface Feature {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    permission: Permissions;
}

const features: Feature[] = [
    {
        title: "Investors",
        description: "Manage your company's investors and their information",
        icon: Users,
        href: "/investors",
        color: "text-blue-500",
        permission: Permissions.INVESTOR_LIST,
    },
    {
        title: "Companies",
        description: "Manage your portfolio companies",
        icon: Building2,
        href: "/companies",
        color: "text-green-500",
        permission: Permissions.COMPANY_LIST,
    },
    {
        title: "Rounds",
        description: "Track and manage funding rounds",
        icon: CircleDollarSign,
        href: "/rounds",
        color: "text-purple-500",
        permission: Permissions.ROUND_LIST,
    },
    {
        title: "Instruments",
        description: "Manage financial instruments and investments",
        icon: Briefcase,
        href: "/instruments",
        color: "text-orange-500",
        permission: Permissions.INSTRUMENT_READ,
    },
    {
        title: "Cap Table",
        description: "View and analyze your company's cap table",
        icon: BarChart3,
        href: "/captable",
        color: "text-indigo-500",
        permission: Permissions.COMPANY_READ,
    },
    {
        title: "Settings",
        description: "Manage roles, permissions, and system settings",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
        permission: Permissions.ROLE_LIST,
    },
];

const HomePage = () => {
    return (
        <div className="container mx-auto py-8">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Welcome to CapTable
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage your company&apos;s equity and investments in one place
                </p>
            </div>

            {/* Quick Stats Section */}
            <DashboardStats />

            {/* Quick Actions Grid */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature) => (
                        <Card
                            key={feature.title}
                            className="group hover:shadow-lg transition-all"
                        >
                            <Link href={feature.href}>
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-2">
                                        <feature.icon
                                            className={`h-6 w-6 ${feature.color}`}
                                        />
                                        <CardTitle className="text-xl">
                                            {feature.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-sm">
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="group-hover:translate-x-1 transition-transform"
                                        variant="ghost"
                                    >
                                        View {feature.title}
                                        <span className="ml-2">→</span>
                                    </Button>
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default withPermissionPage(HomePage, {
    permissions: [
        Permissions.COMPANY_READ,
        Permissions.INVESTOR_READ,
        Permissions.ROUND_READ,
        Permissions.INSTRUMENT_READ,
    ],
});
