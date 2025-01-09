CREATE TABLE scenarios (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    new_investment NUMERIC NOT NULL,
    premoney_valuation NUMERIC NOT NULL,
    result JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE INDEX idx_scenarios_company ON scenarios(company_id);
CREATE INDEX idx_scenarios_created_by ON scenarios(created_by); 