import { z } from "zod";
import { captableSchema } from "@/lib/schemas/captable-schemas";

export interface CapTableInstrumentSummary {
  shares: number;
  value: number;
}

export interface CapTableSafePosition {
  invested: number;
  potentialShares: number;
  valuationCap: number | null;
  discountRate: number;
}

export interface CapTableNotePosition {
  invested: number;
  potentialShares: number;
  valuationCap: number | null;
  discountRate: number;
  interestRate: number;
  maturityDate: Date;
  accruedInterest: number;
}

export interface CapTableEntry {
  investorId: string;
  investorName: string;
  shares: number;
  ownership: number;
  value: number;
  instruments: {
    equity: CapTableInstrumentSummary;
    safe: CapTableSafePosition[];
    convertibleNote: CapTableNotePosition[];
  };
}

export interface CapTableRound {
  id: string;
  name: string;
  date: Date;
  preMoney: number;
  postMoney: number;
  newShares: number;
  newInvestment: number;
  entries: CapTableEntry[];
}

export interface CapTableSummary {
  companyId: string;
  companyName: string;
  totalShares: number;
  totalValue: number;
  fullyDilutedShares: number;
  rounds: CapTableRound[];
  entries: CapTableEntry[];
}

export type GenerateCapTableInput = z.infer<typeof captableSchema>; 