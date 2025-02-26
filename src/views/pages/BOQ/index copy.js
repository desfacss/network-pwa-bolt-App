import React, { useState } from 'react';
import { Form, Input, Button, Table, Space, DatePicker, Select, InputNumber } from 'antd';
// import { useForm } from '@rjsf/core';
// import Form from '@rjsf/antd';
// import antd from '@rjsf/antd/lib/theme';
import DynamicForm from '../DynamicForm';

// // Your custom DynamicForm component
// const DynamicForm = ({ schemas }) => {
//     const { Form: RJForm } = useForm({
//         schema: schemas.data_schema,
//         uiSchema: schemas.ui_schema, // Pass the uiSchema
//         widgets: {
//             DateWidget: Form.Widgets.DateWidget,
//         },
//         theme: antd,
//         onChange: (event) => {
//             if (schemas.onChange) { // Call any onChange provided by the user
//                 schemas.onChange(event);
//             }
//         },
//         onSubmit: (data) => {
//             if (schemas.onSubmit) { // Call any onSubmit provided by the user
//                 schemas.onSubmit(data);
//             }
//         },
//     });

//     return <RJForm />;
// };



const InvoicePage = () => {
    const [invoiceData, setInvoiceData] = useState({
        items: [],
        total: 0,
    });

    const data_schema = { // Your data schema
        title: "Purchase Order Invoice",
        type: "object",
        properties: {
            invoiceNumber: { type: "string", title: "Invoice Number" },
            date: { type: "string", title: "Date", format: "date" },
            vendor: { type: "string", title: "Vendor" },
            customer: { type: "string", title: "Customer" },
            items: {
                type: "array",
                title: "Items",
                items: {
                    type: "object",
                    properties: {
                        description: { type: "string", title: "Description" },
                        quantity: { type: "number", title: "Quantity" },
                        unitPrice: { type: "number", title: "Unit Price" },
                    },
                },
            },
        },
    };

    const ui_schema = { // Your UI schema (optional, but good practice)
        date: {
            "ui:widget": "date", // Use the date widget for the date field
        },
        items: {
            items: {
                quantity: { "ui:widget": "updown" }, // Use updown widget for quantity
                unitPrice: { "ui:widget": "updown" } // Use updown widget for unitPrice
            }
        }
    };


    const handleFormChange = (event) => {
        setInvoiceData(event.formData);
        calculateTotal(event.formData.items);
    }

    const handleFormSubmit = (data) => {
        console.log("Invoice Data Submitted:", data.formData);
    };


    const calculateTotal = (items) => {
        // ... (same as before)
    };

    const columns = [
        // ... (same as before)
    ];

    return (
        <div>
            <h1>Purchase Order Invoice</h1>

            <DynamicForm
                schemas={{
                    data_schema: data_schema,
                    ui_schema: ui_schema,
                    // onChange: handleFormChange, // Pass the change handler
                    // onSubmit: handleFormSubmit   // Pass the submit handler
                }}
            />

            <h2>Invoice Items</h2>
            <Table columns={columns} dataSource={invoiceData.items} bordered pagination={false} />

            {/* ... (rest of the component - total and print button) */}
        </div>
    );
};

export default InvoicePage;