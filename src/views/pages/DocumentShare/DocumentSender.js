import React, { useEffect, useState } from 'react';
import { Form, Select, Button, message, Card } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import GeneralDocumentComponent from '../Templates/GeneralDocumentComponent4';

const SenderComponent = () => {
    const [form] = Form.useForm();
    const { session } = useSelector((state) => state.auth);
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedTable, setSelectedTable] = useState('documents'); // Default table

    useEffect(() => {
        fetchDocuments(selectedTable);
    }, [selectedTable]);

    const fetchDocuments = async (tableName) => {
        const { data, error } = await supabase.from(tableName).select('id, name, content, type');
        if (error) {
            console.error(`Error fetching documents from ${tableName}:`, error);
            message.error(`Failed to load documents from ${tableName}`);
        } else {
            setDocuments(data);
        }
    };

    const handleTableSelect = (value) => {
        setSelectedTable(value);
        setSelectedDocument(null); // Reset selected document when table changes
    };

    const handleDocumentSelect = (value) => {
        const doc = documents.find((d) => d.id === value);
        setSelectedDocument(doc);
    };

    const onFinish = (values) => {
        const doc = documents.find((d) => d.id === values.document);
        if (doc) {
            setSelectedDocument(doc);
        }
    };

    return (
        <Card style={{ padding: '20px' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Form.Item label="" name="table" rules={[{ required: true, message: 'Please select a table' }]}>
                        <Select onChange={handleTableSelect} placeholder="Choose a table" defaultValue="documents" style={{ flex: 1 }}>
                            <Select.Option value="documents">Documents</Select.Option>
                            <Select.Option value="invoices">Invoices</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="" name="document" rules={[{ required: true, message: 'Please select a document' }]} style={{ flex: 2 }}>
                        <Select onChange={handleDocumentSelect} placeholder="Choose a document" style={{ width: '200px' }}>
                            {documents.map((doc) => (
                                <Select.Option key={doc.id} value={doc.id}>
                                    {doc.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>
                {/* <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Load Document
                    </Button>
                </Form.Item> */}
            </Form>

            {selectedDocument && (
                <GeneralDocumentComponent formName={selectedDocument.type} initialData={selectedDocument} documentTable={selectedTable} />
            )}
        </Card>
    );
};

export default SenderComponent;