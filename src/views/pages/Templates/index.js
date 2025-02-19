import { Card } from 'antd';
import React from 'react';
// import InvoiceEntryPage from './invoice';
import Invoice from './inv'
import Template from './Template';
import WorkOrder from './WorkOrder';
import CompletionCertificate from './CompletionCertificate';

import GeneralDocumentComponent from './GeneralDocumentComponent';
import invoiceConfig from './configs/invoiceConfig.json';
import purchaseOrderConfig from './configs/purchaseOrderConfig.json';
import workOrderConfig from './configs/workOrderConfig.json';
import completionCertificateConfig from './configs/completionCertificateConfig.json';
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