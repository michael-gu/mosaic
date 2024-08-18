import React from 'react';
import styles from './FilingRow.module.css';
import { Link, Text } from '@fluentui/react-components';

interface FilingRowProps {
  report: {
    cik: string;
    accessionNumber: string;
    filingDate: string;
    reportDate: string;
    form: string;
    primaryDocument: string;
  };
  index: number;
}

const FilingRow: React.FC<FilingRowProps> = ({ report, index }) => {
  const url = `https://www.sec.gov/Archives/edgar/data/${report.cik}/${report.accessionNumber.replace(/-/g, "")}/${report.primaryDocument}`;
  return (
    <div key={index} className={styles.reportRow}>
      <Text><span style={{ fontWeight:"bold" }}>Accession Number:</span> {report.accessionNumber}</Text>
      <br />
      <Text><span style={{ fontWeight:"bold" }}>Filing Date:</span> {report.filingDate}</Text>
      <br />
      <Text><span style={{ fontWeight:"bold" }}>Report Date:</span> {report.reportDate}</Text>
      <br />
      <Text><span style={{ fontWeight:"bold" }}>Transaction:</span> {(report.form === "3" || report.form === "4") ? "Purchased Stock" : "Sold Stock"}</Text>
      <br />
      <Text><span style={{ fontWeight:"bold" }}>URL:</span> <Link href={url} target="_blank" rel="noopener noreferrer"><Text style={{ color:"blue" }}>Filing Report</Text></Link></Text>
    </div>
  );
};

export default FilingRow;