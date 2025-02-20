import { Card } from 'antd';
import React from 'react';
// import InvoiceEntryPage from './invoice';
import Invoice from './inv'
import Template from './Template';
import WorkOrder from './WorkOrder';
import CompletionCertificate from './CompletionCertificate';

import GeneralDocumentComponent from './GeneralDocumentComponent4';

import invoiceConfig from './configs4/invoiceConfig.json';
import purchaseOrderConfig from './configs4/purchaseOrderConfig.json';
import workOrderConfig from './configs4/workOrderConfig.json';
import completionCertificateConfig from './configs4/completionCertificateConfig.json';
import BillOfQuantity from './BOQ';
import boqData from './boq_v2.json';

const App = () => {
  return (
    <Card>
      {/* <BillOfQuantity initialData={boqData} /> */}
      {/* <Invoice /> */}
      {/* <Template />
      <WorkOrder /> */}
      {/* <CompletionCertificate /> */}
      <h2>Invoice</h2>
      <GeneralDocumentComponent config={invoiceConfig} />

      <h2>Purchase Order</h2>
      <GeneralDocumentComponent config={purchaseOrderConfig} />

      <h2>Work Order</h2>
      <GeneralDocumentComponent config={workOrderConfig} />

      <h2>Completion Certificate</h2>
      <GeneralDocumentComponent config={completionCertificateConfig} />
    </Card>
  );
};

export default App;