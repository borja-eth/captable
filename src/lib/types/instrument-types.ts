import { z } from "zod";
import { instrumentSchema } from "@/lib/schemas/instrument-schemas";

export type InstrumentType = "EQUITY" | "SAFE" | "CONVERTIBLE_NOTE";

export interface BaseInstrument {
  id: string;
  roundId: string;
  investorId: string;
  type: InstrumentType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquityInstrument extends BaseInstrument {
  type: "EQUITY";
  sharePrice: number;
  shareCount: number;
  shareClass: "COMMON" | "PREFERRED";
}

export interface SafeInstrument extends BaseInstrument {
  type: "SAFE";
  valuationCap: number;
  discountRate: number;
}

export interface ConvertibleNoteInstrument extends BaseInstrument {
  type: "CONVERTIBLE_NOTE";
  interestRate: number;
  maturityDate: Date;
  conversionCap: number;
  discountRate: number;
}

export type Instrument = EquityInstrument | SafeInstrument | ConvertibleNoteInstrument;
export type CreateInstrumentInput = z.infer<typeof instrumentSchema>;