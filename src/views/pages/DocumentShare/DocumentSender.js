import React, { useEffect, useState } from 'react';
import { Form, Select, Button, message } from 'antd';
import { supabase } from 'configs/SupabaseConfig';
import { useSelector } from 'react-redux';
import GeneralDocumentComponent from '../Templates/GeneralDocumentComponent4';

const SenderComponent = () => {
    const [form] = Form.useForm();
    const { session } = useSelector((state) => state.auth);
    const [documents, setDocuments] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        const { data, error } = await supabase.from('documents').select('id, title, content, type');
        if (error) {
            console.error('Error fetching documents:', error);
            message.error('Failed to load documents');
        } else {
            setDocuments(data);
        }
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
        <div style={{ padding: '20px' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Select Document" name="document" rules={[{ required: true, message: 'Please select a document' }]}>
                    <Select onChange={handleDocumentSelect} placeholder="Choose a document">
                        {documents.map((doc) => (
                            <Select.Option key={doc.id} value={doc.id}>
                                {doc.title}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                {/* <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Load Document
                    </Button>
                </Form.Item> */}
            </Form>

            {selectedDocument && (
                <GeneralDocumentComponent formName={selectedDocument.type} initialData={selectedDocument} />
            )}
        </div>
    );
};

export default SenderComponent;