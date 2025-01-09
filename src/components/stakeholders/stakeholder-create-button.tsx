"use client";

import { AddStakeholderModal } from "./add-stakeholder-modal";

interface StakeholderCreateButtonProps {
    companyId: string;
}

export const StakeholderCreateButton = ({
    companyId,
}: StakeholderCreateButtonProps) => {
    return <AddStakeholderModal companyId={companyId} />;
};
