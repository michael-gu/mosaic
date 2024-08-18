import React, { useEffect, useState } from 'react';
import styles from './TradeDisplay.module.css';
import { Field, Text, SearchBox, Button } from '@fluentui/react-components';
import { secCompanyData } from '../data/company_tickers';
import { CompanyData, FilingData, TradeReport } from '../types/CompanyDataTypes';
import FilingRow from '../components/FilingRow';

export function TradeDisplay() {
  const [selectedCompanyID, setSelectedCompanyID] = useState<
    number | undefined
  >(undefined);
  const [selectedCompanyMetadata, setSelectedCompanyMetadata] = useState<CompanyData | undefined>(undefined);
  const [selectedCompanyTrades, setSelectedCompanyTrades] = useState<any>(undefined);

  const [companyTickers, setCompanyTickers] = useState<string[]>([]);
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [companyCIKs, setCompanyCIKs] = useState<number[]>([]);
  const [companyFilings, setCompanyFilings] = useState<TradeReport | undefined>(undefined);
  const [numFilings, setNumFilings] = useState<number>(0);
  const [filingDataList, setFilingDataList] = useState<FilingData[]>([]);
  const [reportStartIndex, setReportStartIndex] = useState<number>(0);
  const [reportEndIndex, setReportEndIndex] = useState<number>(5);

  useEffect(() => {
    if (companyFilings && numFilings > 0) {
      const newFilingDataList = [];
      for (let i = 0; i < companyFilings.accessionNumber.length; i++) {
        if (companyFilings.form[i] === '3' || companyFilings.form[i] === '4' || companyFilings.form[i] === '144') {
          const filingData = {
            cik: selectedCompanyMetadata!.cik_str.toString(),
            accessionNumber: companyFilings.accessionNumber[i],
            filingDate: companyFilings.filingDate[i],
            reportDate: companyFilings.reportDate[i],
            form: companyFilings.form[i],
            primaryDocument: companyFilings.primaryDocument[i],
          };
          newFilingDataList.push(filingData);
        }
      }
      setFilingDataList(newFilingDataList);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilings]);

  useEffect(() => {
    const fetchCompanyData = () => {
      const tickers: string[] = [];
      const names: string[] = [];
      const ciks: number[] = [];
      for (const key in secCompanyData) {
        if (secCompanyData.hasOwnProperty(key)) {
          tickers.push(secCompanyData[key].ticker);
          names.push(secCompanyData[key].title);
          ciks.push(secCompanyData[key].cik_str);
        }
      }
      setCompanyTickers(tickers);
      setCompanyNames(names);
      setCompanyCIKs(ciks);
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    setSelectedCompanyMetadata(getDataByID(selectedCompanyID));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyID]);

  useEffect(() => {
    const processedCIK = selectedCompanyMetadata?.cik_str.toString().padStart(10, '0');
    const fetchSECData = async () => {
      try {
        let apiCallStatus = false;
        let attempts = 0;
        while (apiCallStatus !== true && attempts <= 3 ) {
          const url = `https://data.sec.gov/submissions/CIK${processedCIK}.json`;
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'University of Washington CS Student michgu@cs.washington.edu',
              'Accept-Encoding': 'gzip, deflate',
              'Host': 'www.sec.gov'
            }
          });
          if (response.ok) {
            apiCallStatus = true;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              setSelectedCompanyTrades(data);
            }
            
          } else {
            console.error('Failed to fetch SEC data');
          }
          attempts++;
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchSECData();
  }, [selectedCompanyMetadata]);

  useEffect(() => {
    if (selectedCompanyTrades !== undefined) {
      const currReport: TradeReport = {
        accessionNumber: selectedCompanyTrades["filings"]["recent"]["accessionNumber"],
        filingDate: selectedCompanyTrades["filings"]["recent"]["filingDate"],
        reportDate: selectedCompanyTrades["filings"]["recent"]["reportDate"],
        acceptanceDateTime: selectedCompanyTrades["filings"]["recent"]["acceptanceDateTime"],
        act: selectedCompanyTrades["filings"]["recent"]["act"],
        form: selectedCompanyTrades["filings"]["recent"]["form"],
        fileNumber: selectedCompanyTrades["filings"]["recent"]["fileNumber"],
        filmNumber: selectedCompanyTrades["filings"]["recent"]["filmNumber"],
        items: selectedCompanyTrades["filings"]["recent"]["items"],
        size: selectedCompanyTrades["filings"]["recent"]["size"],
        isXBRL: selectedCompanyTrades["filings"]["recent"]["isXBRL"],
        isInlineXBRL: selectedCompanyTrades["filings"]["recent"]["isInlineXBRL"],
        primaryDocument: selectedCompanyTrades["filings"]["recent"]["primaryDocument"],
        primaryDocDescription: selectedCompanyTrades["filings"]["recent"]["primaryDocDescription"],
      };
      setCompanyFilings(currReport);
      setNumFilings(selectedCompanyTrades["filings"]["recent"]["items"].length);
      downloadReports();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyTrades]);

  const downloadReports = async () => {
    for (let i = 0; i < 5; i++) {
      try {
        const url = `https://www.sec.gov/Archives/edgar/data/${selectedCompanyTrades.cik[i]}/${selectedCompanyTrades.accessionNumber[i].replace(/-/g, "")}/${selectedCompanyTrades.primaryDocument[i]}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'University of Washington CS Student',
            'Accept-Encoding': 'gzip, deflate',
            'Host': 'www.sec.gov'
          }
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const content = await response.text();
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `report_${i}.txt`;
  
        // Append the link to the body (required for Firefox)
        document.body.appendChild(link);
  
        // Programmatically click the link to trigger the download
        link.click();
  
        // Remove the link from the document
        document.body.removeChild(link);
  
        console.log(`Downloaded and saved: report_${i}.txt`);
      } catch (e) {
        console.error(e);
      }
    }
  }

  const getDataByID = (id: number | undefined): CompanyData | undefined => {
    if (id && id >= 0 && id < companyTickers.length) {
      return {
        ticker: companyTickers[id],
        title: companyNames[id],
        cik_str: companyCIKs[id],
      };
    }
    return undefined;
  };

  const getIDByTicker = (ticker: string) => {
    return companyTickers.indexOf(ticker);
  };

  const handleSearchQueryChange = (event: React.KeyboardEvent<HTMLInputElement>, data: { value: string }) => {
    const query = data.value.toUpperCase(); 
    if (event.key === 'Enter') {
      const id = getIDByTicker(query);
      if (id !== -1) {
        console.log(`User has queried company: ${companyNames[id]}`);
        setSelectedCompanyID(id);
      } else {
        setSelectedCompanyID(undefined);
      }
      setReportStartIndex(0);
      setReportEndIndex(5);
    }
  };

  const handleBackClick = () => {
    if ((reportStartIndex - 5) >= 0) {
      setReportStartIndex(reportStartIndex - 5);
      setReportEndIndex(reportEndIndex - 5);
    }
  }
  
  const handleNextClick = () => {
    if ((reportEndIndex + 5) <= filingDataList.length) {
      setReportStartIndex(reportStartIndex + 5);
      setReportEndIndex(reportEndIndex + 5);
    }

  }

  return (
    <div className={styles.body}>
      <Text className={styles.title}>Company Insider Trading Database Search</Text>
      <Field className={styles.subtitle} label="Search for a ticker to get company information">
        <div className={styles.searchboxContainer}>
          <SearchBox className={styles.searchbox} appearance='filled-darker-shadow' size="small" onKeyDown={(event) => handleSearchQueryChange(event as React.KeyboardEvent<HTMLInputElement>, { value: (event.target as HTMLInputElement).value })}/>
        </div>
      </Field>
      {selectedCompanyID && (
        <>
          <div className={styles.resultsHeader}>
            <Text style={{ fontSize:"1.3vw" }}>Showing results for <span style={{ fontWeight:"bold" }}>{selectedCompanyMetadata?.title}</span>:</Text>
            <div className={styles.buttonContainer}>
              <Button className={styles.button} onClick={handleBackClick}>Back</Button>
              <Button className={styles.button} onClick={handleNextClick}>Next</Button>
            </div>
          </div>
          <br></br>
          {filingDataList.slice(reportStartIndex, reportEndIndex).slice(0, 10).map((filingData, index) => (
            <FilingRow key={index} report={filingData} index={index} />
          ))}
        </>
      )}
    </div>
  );
}

export default TradeDisplay;
