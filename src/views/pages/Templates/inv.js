// import React, { useState } from 'react';
// import { Form, Input, Select, Button, Table, InputNumber, DatePicker, Row, Col, Typography, Card } from 'antd';
// const { TextArea } = Input;
// const { Title } = Typography;
// const { Option } = Select;

// // Mock data for demonstration
// const customers = [
//   { id: 1, name: "Customer A", address: "123 Main St" },
//   { id: 2, name: "Customer B", address: "456 Pine St" },
// ];

// const Invoice = () => {
//   const [form] = Form.useForm();
//   const [services, setServices] = useState([{ id: 1, name: '', quantity: 1, price: 0 }]);
//   const [customer, setCustomer] = useState(null);

//   const columns = [
//     {
//       title: 'Service',
//       dataIndex: 'name',
//       key: 'name',
//       render: (text, record, index) => (
//         <Input 
//           value={text} 
//           onChange={(e) => handleServiceChange(index, 'name', e.target.value)} 
//         />
//       ),
//     },
//     {
//       title: 'Quantity',
//       dataIndex: 'quantity',
//       key: 'quantity',
//       render: (text, record, index) => (
//         <InputNumber 
//           min={1} 
//           value={text} 
//           onChange={(value) => handleServiceChange(index, 'quantity', value)} 
//         />
//       ),
//     },
//     {
//       title: 'Price',
//       dataIndex: 'price',
//       key: 'price',
//       render: (text, record, index) => (
//         <InputNumber 
//           min={0} 
//           value={text} 
//           onChange={(value) => handleServiceChange(index, 'price', value)} 
//           formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//           parser={value => value.replace(/\$\s?|(,*)/g, '')}
//         />
//       ),
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       render: (_, record, index) => (
//         <Button onClick={() => removeService(index)}>Delete</Button>
//       ),
//     },
//   ];

//   const handleServiceChange = (index, key, value) => {
//     const newServices = [...services];
//     newServices[index][key] = value;
//     setServices(newServices);
//   };

//   const addService = () => {
//     setServices([...services, { id: services.length + 1, name: '', quantity: 1, price: 0 }]);
//   };

//   const removeService = (index) => {
//     const newServices = [...services];
//     newServices.splice(index, 1);
//     setServices(newServices);
//   };

//   const handleCustomerChange = (value) => {
//     const selectedCustomer = customers.find(c => c.id === value);
//     setCustomer(selectedCustomer);
//   };

//   const calculateTotal = () => {
//     return services.reduce((sum, service) => sum + (service.quantity * service.price), 0);
//   };

//   return (
//     <Card title="Invoice">
//       <Form form={form} layout="vertical">
//         <Row gutter={16}>
//           <Col span={12}>
//             <Form.Item label="Invoice Number">
//               <Input />
//             </Form.Item>
//             <Form.Item label="Date">
//               <DatePicker />
//             </Form.Item>
//             <Form.Item label="Customer">
//               <Select onChange={handleCustomerChange}>
//                 {customers.map(customer => (
//                   <Option key={customer.id} value={customer.id}>{customer.name}</Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </Col>
//           <Col span={12}>
//             <Form.Item label="From (Company Name)">
//               <Input defaultValue="Your Company Name" />
//             </Form.Item>
//             <Form.Item label="From (Address)">
//               <Input defaultValue="Your Company Address" />
//             </Form.Item>
//             {customer && (
//               <>
//                 <Form.Item label="To (Name)">
//                   <Input value={customer.name} disabled />
//                 </Form.Item>
//                 <Form.Item label="To (Address)">
//                   <Input value={customer.address} disabled />
//                 </Form.Item>
//               </>
//             )}
//           </Col>
//         </Row>

//         <Title level={4}>Services</Title>
//         <Table columns={columns} dataSource={services} pagination={false} />
//         <Button onClick={addService}>Add Service</Button>

//         <Title level={4}>Summary</Title>
//         <Row>
//           <Col span={12}>
//             <Form.Item label="Subtotal">
//               <InputNumber value={calculateTotal()} disabled />
//             </Form.Item>
//             <Form.Item label="Tax (10%)">
//               <InputNumber value={calculateTotal() * 0.1} disabled />
//             </Form.Item>
//             <Form.Item label="Total">
//               <InputNumber value={calculateTotal() * 1.1} disabled />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Title level={4}>Terms and Conditions</Title>
//         <TextArea rows={4} placeholder="Enter terms and conditions here" />

//         <Title level={4}>Remarks</Title>
//         <TextArea rows={2} placeholder="Any additional remarks?" />

//         <Title level={4}>Signature</Title>
//         <p>____________________________________</p>
//         <p>Signature</p>

//         <Form.Item>
//           <Button type="primary">Save Invoice</Button>
//         </Form.Item>
//       </Form>
//     </Card>
//   );
// };

// export default Invoice;



import React, { useState } from 'react';
import { Form, Input, Select, Button, Table, InputNumber, DatePicker, Row, Col, Typography, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

// Mock data for demonstration
const customers = [
  { id: 1, name: "Customer A", address: "123 Main St" },
  { id: 2, name: "Customer B", address: "456 Pine St" },
];

const Invoice = () => {
  const [form] = Form.useForm();
  const [services, setServices] = useState([{ id: 1, name: '', quantity: 1, price: 0 }]);
  const [customer, setCustomer] = useState(null);

  const columns = [
    {
      title: '',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <Input 
          value={text} 
          onChange={(e) => handleServiceChange(index, 'name', e.target.value)} 
          bordered={false}
          style={{ border: 'none', width: '100%' }}
        />
      ),
    },
    {
      title: '',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record, index) => (
        <InputNumber 
          min={1} 
          value={text} 
          onChange={(value) => handleServiceChange(index, 'quantity', value)} 
          bordered={false}
          style={{ border: 'none', width: '100%' }}
        />
      ),
    },
    {
      title: '',
      dataIndex: 'price',
      key: 'price',
      render: (text, record, index) => (
        <InputNumber 
          min={0} 
          value={text} 
          onChange={(value) => handleServiceChange(index, 'price', value)} 
          bordered={false}
          style={{ border: 'none', width: '100%' }}
          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      ),
    },
  ];

  const handleServiceChange = (index, key, value) => {
    const newServices = [...services];
    newServices[index][key] = value;
    setServices(newServices);
  };

  const addService = () => {
    setServices([...services, { id: services.length + 1, name: '', quantity: 1, price: 0 }]);
  };

  const handleCustomerChange = (value) => {
    const selectedCustomer = customers.find(c => c.id === value);
    setCustomer(selectedCustomer);
  };

  const calculateTotal = () => {
    return services.reduce((sum, service) => sum + (service.quantity * service.price), 0);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      {/* Header with Logo and Company Info */}
      <Row justify="space-between" gutter={16}>
        <Col span={12}>
          <img src="/path/to/your/logo.png" alt="Company Logo" style={{ maxWidth: '150px' }} />
          <div>
            <p>Your Company Name</p>
            <p>Your Company Address</p>
          </div>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Title level={4}>INVOICE</Title>
        </Col>
      </Row>

      {/* Customer Selection */}
      <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
        <Form.Item label="Customer">
          <Select onChange={handleCustomerChange} bordered={false}>
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>{customer.name}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Invoice Details */}
        {customer && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Invoice Number">
                <Input bordered={false} />
              </Form.Item>
              <Form.Item label="Date">
                <DatePicker bordered={false} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="To (Name)">
                <Input value={customer.name} disabled bordered={false} />
              </Form.Item>
              <Form.Item label="To (Address)">
                <Input value={customer.address} disabled bordered={false} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Services Table */}
        <Title level={4} style={{ marginTop: '20px' }}>Services</Title>
        <Table 
          columns={columns} 
          dataSource={services} 
          pagination={false} 
          showHeader={false}
          bordered={false}
          size="small"
          style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}
        />
        <Button onClick={addService} style={{ marginTop: '10px', border: 'none' }}>Add Service</Button>

        {/* Summary */}
        <Title level={4} style={{ marginTop: '20px' }}>Summary</Title>
        <Row justify="end" style={{ marginBottom: '10px' }}>
          <Col span={12}>
            <Row justify="space-between">
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </Row>
            <Row justify="space-between">
              <span>Tax (10%):</span>
              <span>${(calculateTotal() * 0.1).toFixed(2)}</span>
            </Row>
            <Row justify="space-between" style={{ fontWeight: 'bold' }}>
              <span>Total:</span>
              <span>${(calculateTotal() * 1.1).toFixed(2)}</span>
            </Row>
          </Col>
        </Row>

        {/* Terms and Conditions, Remarks, Signature */}
        <Title level={4}>Terms and Conditions</Title>
        <TextArea rows={4} bordered={false} placeholder="Enter terms and conditions here" />
        <Title level={4} style={{ marginTop: '20px' }}>Remarks</Title>
        <TextArea rows={2} bordered={false} placeholder="Any additional remarks?" />
        <Title level={4} style={{ marginTop: '20px' }}>Signature</Title>
        <p style={{ borderTop: '1px solid #000', marginTop: '10px', paddingTop: '10px' }}>____________________________________</p>
        <p>Signature</p>

        {/* Save/Download Button */}
        <Form.Item style={{ textAlign: 'right', marginTop: '20px' }}>
          <Button type="primary" icon={<DownloadOutlined />}>Save as PDF</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Invoice;