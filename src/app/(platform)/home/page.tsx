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

const features = [
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
    title: "Analytics",
    description: "View insights and reports about your cap table",
    icon: BarChart3,
    href: "/analytics",
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

const DashboardPage = () => {
  return (
    <div className="container mx-auto py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to CapTable</h1>
        <p className="text-muted-foreground text-lg">
          Manage your company&apos;s equity and investments in one place
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="group hover:shadow-lg transition-all">
            <Link href={feature.href}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
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

      {/* Quick Stats Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Investment
              </CardTitle>
              <div className="text-2xl font-bold">$10.2M</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Investors
              </CardTitle>
              <div className="text-2xl font-bold">24</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Open Rounds
              </CardTitle>
              <div className="text-2xl font-bold">3</div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Companies
              </CardTitle>
              <div className="text-2xl font-bold">12</div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your cap table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activity Items */}
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New investor added</p>
                  <p className="text-sm text-muted-foreground">John Doe joined as an individual investor</p>
                </div>
                <div className="text-sm text-muted-foreground">2h ago</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Round closed</p>
                  <p className="text-sm text-muted-foreground">Series A funding round successfully closed</p>
                </div>
                <div className="text-sm text-muted-foreground">1d ago</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New instrument created</p>
                  <p className="text-sm text-muted-foreground">SAFE agreement added for TechCorp Inc.</p>
                </div>
                <div className="text-sm text-muted-foreground">2d ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withPermissionPage(DashboardPage, {
  permissions: [], // Empty array since this is the main dashboard
}); 