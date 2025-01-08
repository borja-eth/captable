import type { DatabaseConnection } from "@/database";
import { generateCapTableSchema } from "@/lib/schemas/captable-schemas";
import { getCompanyById } from "@/lib/services/company-service";
import { listInstrumentsByRound } from "@/lib/services/instrument-service";
import { getInvestorById } from "@/lib/services/investor-service";
import { listRoundsByCompany } from "@/lib/services/round-service";
import type {
  CapTableEntry,
  CapTableRound,
  CapTableSummary,
  GenerateCapTableInput
} from "@/lib/types/captable-types";
import type { Instrument } from "@/lib/types/instrument-types";
import type { Round } from "@/lib/types/round-types";
import { SERVER_ERRORS, ServerError } from "@/lib/types/server-error";

interface CalculateSharesInput {
  instrument: Instrument;
  currentValuation: number;
  date: Date;
}

const calculateShares = ({ instrument, currentValuation, date }: CalculateSharesInput) => {
  switch (instrument.type) {
    case "EQUITY":
      return {
        shares: instrument.shareCount,
        value: instrument.shareCount * instrument.sharePrice
      };
    case "SAFE": {
      const effectiveValuation = Math.min(
        currentValuation,
        instrument.valuationCap || currentValuation
      );
      const discountedValuation = effectiveValuation * (1 - instrument.discountRate / 100);
      const potentialShares = (instrument.amount / discountedValuation) * currentValuation;

      return {
        shares: potentialShares,
        value: instrument.amount
      };
    }
    case "CONVERTIBLE_NOTE": {
      const effectiveValuation = Math.min(
        currentValuation,
        instrument.conversionCap || currentValuation
      );
      const discountedValuation = effectiveValuation * (1 - instrument.discountRate / 100);
      const daysDiff = Math.max(0, date.getTime() - instrument.maturityDate.getTime()) / (1000 * 60 * 60 * 24);
      const accruedInterest = instrument.amount * (instrument.interestRate / 100) * (daysDiff / 365);
      const totalAmount = instrument.amount + accruedInterest;
      const potentialShares = (totalAmount / discountedValuation) * currentValuation;

      return {
        shares: potentialShares,
        value: totalAmount
      };
    }
  }
};

const calculateRoundCapTable = async ({
  round,
  instruments,
  currentValuation,
  date,
  connection,
}: {
  round: Round;
  instruments: Instrument[];
  currentValuation: number;
  date: Date;
  connection?: DatabaseConnection;
}): Promise<CapTableRound> => {
  const investorPositions = new Map<string, CapTableEntry>();

  // Process each instrument
  for (const instrument of instruments) {
    const investor = await getInvestorById({ id: instrument.investorId, connection });

    if (!investor) {
      throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
    }

    let entry = investorPositions.get(investor.id);

    if (!entry) {
      entry = {
        investorId: investor.id,
        investorName: investor.name,
        shares: 0,
        ownership: 0,
        value: 0,
        instruments: {
          equity: { shares: 0, value: 0 },
          safe: [],
          convertibleNote: []
        }
      };
      investorPositions.set(investor.id, entry);
    }

    const { shares, value } = calculateShares({ instrument, currentValuation, date });

    switch (instrument.type) {
      case "EQUITY": {
        entry.instruments.equity.shares += shares;
        entry.instruments.equity.value += value;
        entry.shares += shares;
        entry.value += value;
        break;
      }
      case "SAFE": {
        entry.instruments.safe.push({
          invested: instrument.amount,
          potentialShares: shares,
          valuationCap: instrument.valuationCap,
          discountRate: instrument.discountRate
        });
        entry.value += value;
        break;
      }
      case "CONVERTIBLE_NOTE": {
        const daysDiff = Math.max(0, date.getTime() - instrument.maturityDate.getTime()) / (1000 * 60 * 60 * 24);
        const accruedInterest = instrument.amount * (instrument.interestRate / 100) * (daysDiff / 365);
        
        entry.instruments.convertibleNote.push({
          invested: instrument.amount,
          potentialShares: shares,
          valuationCap: instrument.conversionCap,
          discountRate: instrument.discountRate,
          interestRate: instrument.interestRate,
          maturityDate: instrument.maturityDate,
          accruedInterest
        });
        entry.value += value;
        break;
      }
    }
  }

  // Calculate totals
  const roundEntries = Array.from(investorPositions.values());
  const totalShares = roundEntries.reduce((sum, entry) => sum + entry.shares, 0);
  const totalValue = roundEntries.reduce((sum, entry) => sum + entry.value, 0);

  // Calculate ownership percentages
  roundEntries.forEach(entry => {
    entry.ownership = totalShares > 0 ? (entry.shares / totalShares) * 100 : 0;
  });

  // Calculate post-money valuation
  const postMoneyValuation = round.preMoneyValuation + totalValue;

  return {
    id: round.id,
    name: round.name,
    date: round.date,
    preMoney: round.preMoneyValuation,
    postMoney: postMoneyValuation,
    newShares: totalShares,
    newInvestment: totalValue,
    entries: roundEntries
  };
};

export const generateCapTable = async ({
  data,
  connection,
}: {
  data: GenerateCapTableInput;
  connection?: DatabaseConnection;
}): Promise<CapTableSummary> => {
  // Validate input data
  const validatedData = generateCapTableSchema.parse(data);
  const date = validatedData.date || new Date();

  // Get company
  const company = await getCompanyById({ id: validatedData.companyId, connection });

  if (!company) {
    throw new ServerError(SERVER_ERRORS.UNHANDLED_ERROR);
  }

  // Get rounds
  const rounds = await listRoundsByCompany({ companyId: company.id, connection });
  const filteredRounds = validatedData.roundIds 
    ? rounds.filter(round => validatedData.roundIds?.includes(round.id))
    : rounds;

  // Sort rounds by date
  const sortedRounds = filteredRounds.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Process each round
  const roundTables: CapTableRound[] = [];
  let currentValuation = validatedData.valuationOverride || 0;

  for (const round of sortedRounds) {
    // Get instruments for the round
    const instruments = await listInstrumentsByRound({ roundId: round.id, connection });
    
    // Calculate round cap table
    const roundTable = await calculateRoundCapTable({
      round,
      instruments,
      currentValuation: currentValuation || round.preMoneyValuation,
      date,
      connection
    });

    roundTables.push(roundTable);
    currentValuation = roundTable.postMoney;
  }

  // Aggregate all entries
  const aggregatedEntries = new Map<string, CapTableEntry>();
  
  for (const roundTable of roundTables) {
    for (const entry of roundTable.entries) {
      let aggregatedEntry = aggregatedEntries.get(entry.investorId);
      
      if (!aggregatedEntry) {
        aggregatedEntry = {
          ...entry,
          shares: 0,
          ownership: 0,
          value: 0,
          instruments: {
            equity: { shares: 0, value: 0 },
            safe: [],
            convertibleNote: []
          }
        };
        aggregatedEntries.set(entry.investorId, aggregatedEntry);
      }

      // Aggregate values
      aggregatedEntry.shares += entry.instruments.equity.shares;
      aggregatedEntry.value += entry.value;
      aggregatedEntry.instruments.equity.shares += entry.instruments.equity.shares;
      aggregatedEntry.instruments.equity.value += entry.instruments.equity.value;
      aggregatedEntry.instruments.safe.push(...entry.instruments.safe);
      aggregatedEntry.instruments.convertibleNote.push(...entry.instruments.convertibleNote);
    }
  }

  // Calculate final totals
  const entries = Array.from(aggregatedEntries.values());
  const totalShares = entries.reduce((sum, entry) => sum + entry.shares, 0);
  const totalValue = entries.reduce((sum, entry) => sum + entry.value, 0);
  const fullyDilutedShares = entries.reduce((sum, entry) => {
    return sum + entry.shares + 
      entry.instruments.safe.reduce((safeSum, safe) => safeSum + safe.potentialShares, 0) +
      entry.instruments.convertibleNote.reduce((noteSum, note) => noteSum + note.potentialShares, 0);
  }, 0);

  // Calculate ownership percentages
  entries.forEach(entry => {
    entry.ownership = totalShares > 0 ? (entry.shares / totalShares) * 100 : 0;
  });

  return {
    companyId: company.id,
    companyName: company.name,
    totalShares,
    totalValue,
    fullyDilutedShares,
    rounds: roundTables,
    entries,
  };
}; 