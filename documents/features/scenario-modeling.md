# Cap Table Scenario Modeling - Product Requirements Document

## Overview
The scenario modeling feature enables users to create and compare different investment and exit scenarios without affecting the actual cap table data. This allows founders and investors to make informed decisions by understanding potential outcomes of various financing strategies.

## Problem Statement
Founders and investors need to:
- Evaluate different investment terms and structures
- Understand dilution impacts of future rounds
- Model potential exit scenarios
- Compare multiple scenarios simultaneously
- Share scenario analysis with stakeholders

## User Stories

### Primary Users
- Founders modeling future funding rounds
- CFOs planning equity strategy
- Investment managers evaluating terms
- Board members reviewing scenarios

## Core Features

### 1. Scenario Creation
- Create new scenarios from current cap table state
- Name and describe scenarios
- Set scenario parameters:
  - Investment amount
  - Pre-money valuation
  - Option pool refresh
  - New investor allocation
  - Pro-rata rights execution
  - Share price
  - Multiple rounds modeling

### 2. Modeling Components

#### Investment Round Modeling
```typescript
interface RoundScenario {
  roundName: string;
  premoneyValuation: number;
  newInvestment: number;
  optionPoolRefresh?: number;
  newInvestors: NewInvestor[];
  proRataParticipation: ProRataAllocation[];
  sharePrice?: number;
  customTerms?: CustomTerms;
}

interface NewInvestor {
  name: string;
  investmentAmount: number;
  negotiatedOwnership?: number;
  shareClass: string;
}

interface ProRataAllocation {
  investorId: string;
  participationPercentage: number;
  maxInvestmentAmount: number;
}
```

#### Exit Modeling
```typescript
interface ExitScenario {
  exitType: 'acquisition' | 'ipo' | 'secondary';
  exitValue: number;
  exitDate: Date;
  liquidationPreferences: boolean;
  employeePoolAcceleration: boolean;
  customDistribution?: DistributionWaterfall;
}
```

### 3. Calculation Engine
- Dilution impact calculation
- Ownership percentages after each round
- Pro-rata rights calculations
- Option pool dilution
- Liquidation preference impact
- Returns analysis
- Waterfall distributions

### 4. Comparison Features
- Side-by-side scenario comparison
- Differential analysis
- Key metrics comparison:
  - Ownership percentages
  - Dilution impact
  - Investment returns
  - Exit proceeds
  - Valuation evolution

### 5. Visualization Tools
- Ownership evolution charts
- Waterfall charts
- Round-by-round dilution graphs
- Exit proceeds distribution
- Valuation progression

### 6. Scenario Management
- Save multiple scenarios
- Clone existing scenarios
- Export scenario analysis
- Share scenarios with stakeholders
- Version control of scenarios

## Technical Requirements

### Frontend Components

#### Scenario Builder
```typescript
interface ScenarioBuilder {
  baseCapTable: CapTable;
  rounds: RoundScenario[];
  exits: ExitScenario[];
  optionPool: OptionPoolConfig;
  customParameters: CustomParameters;
}
```

#### Comparison View
```typescript
interface ScenarioComparison {
  scenarios: Scenario[];
  metrics: MetricDefinition[];
  visualizations: VisualizationType[];
  exportFormat: ExportFormat;
}
```

### Calculation Models

#### Dilution Calculator
```typescript
interface DilutionCalculator {
  calculateOwnership(scenario: Scenario): OwnershipDistribution;
  calculateProRata(round: RoundScenario): ProRataRights;
  calculatePoolImpact(refresh: OptionPoolRefresh): PoolDilution;
}
```

#### Returns Calculator
```typescript
interface ReturnsCalculator {
  calculateROI(scenario: Scenario): InvestmentReturns;
  calculateIRR(scenario: Scenario): IRRMetrics;
  calculateProceeds(exit: ExitScenario): ProceedsDistribution;
}
```

## Implementation Phases

### Phase 1: Basic Scenario Modeling
- Single round modeling
- Basic dilution calculations
- Simple ownership tracking
- Basic comparison view
- Local storage of scenarios

### Phase 2: Advanced Modeling
- Multi-round modeling
- Pro-rata calculations
- Option pool modeling
- Basic exit modeling
- Scenario sharing

### Phase 3: Comprehensive Analysis
- Complex waterfall calculations
- Advanced exit scenarios
- Multiple share classes
- Custom terms
- Advanced visualizations

## Success Metrics
- Scenario creation time < 2 minutes
- Calculation accuracy > 99.9%
- System response time < 500ms
- User satisfaction > 4.5/5
- Feature adoption rate > 60%

## Data Models

### Scenario Model
```typescript
interface Scenario {
  id: string;
  name: string;
  description: string;
  baseCapTable: CapTable;
  rounds: RoundScenario[];
  exits: ExitScenario[];
  created: Date;
  modified: Date;
  createdBy: string;
  version: number;
}
```

### Results Model
```typescript
interface ScenarioResults {
  ownershipEvolution: OwnershipState[];
  returns: InvestorReturns[];
  metrics: ScenarioMetrics;
  comparisons: ComparisonMetrics[];
}
```

## Testing Requirements
- Unit tests for all calculations
- Integration tests for scenario flows
- Performance testing for large scenarios
- Validation of calculation accuracy
- UI/UX testing for usability
- Cross-browser compatibility

## Error Handling
- Invalid scenario parameters
- Calculation edge cases
- Data validation
- User input validation
- State management errors

## Performance Requirements
- Instant calculation updates
- Smooth UI interactions
- Efficient data structures
- Optimized rendering
- Proper memoization

## Security Considerations
- Scenario data encryption
- Access control
- Data privacy
- Audit logging
- Sharing permissions

## Notes for Cursor AI Implementation
- Use TypeScript for type safety
- Implement proper state management (Redux/Context)
- Use React Query for data fetching
- Implement proper caching
- Use proper design patterns
- Consider using web workers for calculations
- Implement proper error boundaries
- Use proper form validation
- Consider using React Table for comparisons