export interface CompanyData {
  cik_str: number;
  ticker: string;
  title: string;
}

export interface TradeReport {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  acceptanceDateTime: string[];
  act: string[];
  form: string[];
  fileNumber: string[];
  filmNumber: string[];
  items: string[];
  size: string[];
  isXBRL: string[];
  isInlineXBRL: string[];
  primaryDocument: string[];
  primaryDocDescription: string[];
}

export interface FilingData {
  cik: string;
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
}

export interface SecCompanyData {
  [key: string]: CompanyData;
}


export interface CompanyTradeData {
  [key: string]: string;
}

export interface TradeData {
  // cik: string;
  // entityType: string;
  // sic: string;
  // sicDescription: string;
  // insiderTransactionForOwnerExists: boolean;
  // insiderTransactionForIssuerExists: boolean;
  // name: string;
  // tickers: string[];
  // exchanges: string[];
  // ein: string;
  // description: string;
  // website: string;
  // investorWebsite: string;
  // category: string;
  // fiscalYearEnd: string;
  // stateOfIncorporation: string;
  // stateOfIncorporationDescription: string;
  // addresses: string[];
  // phone: string;
  // flags: string[];
  // formerNames: string[];
  // filings: Filings;
  [key: string]: string;
}

export interface Filings {
  [key: string]: string;
}