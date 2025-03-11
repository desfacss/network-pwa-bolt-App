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

  const formNameMap = {
    'invoice': 'Invoice',
    'purchase_order': 'Purchase Order',
    'work_order': 'Work Order',
    'completion_certificate': 'Completion Certificate',
    // Add more mappings as needed
  };

  const renderComponent = () => {
    if (visibleDrawer) {
      return <GeneralDocumentComponent formName={visibleDrawer} />;
    }
    return null;
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
        {Object.keys(formNameMap).map((formName) => ( // Dynamically render buttons
          <Button
            key={formName}
            type="primary"
            onClick={() => showDrawer(formName)}
            style={{ marginRight: 8 }}
          >
            {formNameMap[formName]} {/* Use the mapping for display name */}
          </Button>
        ))}
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