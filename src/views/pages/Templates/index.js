import { Button, Card, Drawer } from 'antd';
import React, { useState } from 'react';
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

  const [visibleDrawer, setVisibleDrawer] = useState(null);

  const showDrawer = (type) => {
    setVisibleDrawer(type);
  };

  const closeDrawer = () => {
    setVisibleDrawer(null);
  };

  const renderComponent = () => {
    switch (visibleDrawer) {
      case 'invoice':
        return <GeneralDocumentComponent config={invoiceConfig} />;
      case 'purchaseOrder':
        return <GeneralDocumentComponent config={purchaseOrderConfig} />;
      case 'workOrder':
        return <GeneralDocumentComponent config={workOrderConfig} />;
      case 'completionCertificate':
        return <GeneralDocumentComponent config={completionCertificateConfig} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      {/* <BillOfQuantity initialData={boqData} /> */}
      {/* <Invoice /> */}
      {/* <Template />
      <WorkOrder /> */}
      {/* <CompletionCertificate /> */}


      {/* <h2>Invoice</h2>
      <GeneralDocumentComponent config={invoiceConfig} />

      <h2>Purchase Order</h2>
      <GeneralDocumentComponent config={purchaseOrderConfig} />

      <h2>Work Order</h2>
      <GeneralDocumentComponent config={workOrderConfig} />

      <h2>Completion Certificate</h2>
      <GeneralDocumentComponent config={completionCertificateConfig} /> */}

      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => showDrawer('invoice')}
          style={{ marginRight: 8 }}
        >
          Invoice
        </Button>
        <Button
          type="primary"
          onClick={() => showDrawer('purchaseOrder')}
          style={{ marginRight: 8 }}
        >
          Purchase Order
        </Button>
        <Button
          type="primary"
          onClick={() => showDrawer('workOrder')}
          style={{ marginRight: 8 }}
        >
          Work Order
        </Button>
        <Button
          type="primary"
          onClick={() => showDrawer('completionCertificate')}
        >
          Completion Certificate
        </Button>
      </div>

      <Drawer
        title={visibleDrawer ? visibleDrawer.replace(/([A-Z])/g, ' $1').trim() : ''}
        placement="right"
        onClose={closeDrawer}
        open={visibleDrawer !== null}
        width={"60%"}
      >
        {renderComponent()}
      </Drawer>
    </Card>
  );
};

export default App;