import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Table, Select, Modal, DatePicker, Row, Col } from 'antd';
import { supabase } from 'api/supabaseClient';
// Note: You'll need to import moment for DatePicker to work
import moment from 'moment';
const { Option } = Select;

const BOQForm = () => {
    const [boqInfo, setBoqInfo] = useState({
        client: '',
        jobNo: '',
        date: null, // Using Date object for DatePicker
        drgNo: '',
        revDate: null, // Using Date object for DatePicker
        verifiedBy: '',
        verifiedDate: null, // Using Date object for DatePicker
    });
    const [boqItems, setBoqItems] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch materials from inv_master_materials
    useEffect(() => {
        const fetchMaterials = async () => {
            const { data, error } = await supabase
                .from('inv_master_materials')
                .select('id, description, base_unit, spec');
            if (error) console.error('Error fetching materials:', error);
            else setMaterials(data);
        };
        fetchMaterials();
    }, []);

    // Handle info section changes
    const handleInfoChange = (field, value) => {
        setBoqInfo((prev) => ({ ...prev, [field]: value }));
    };

    // Handle date changes for DatePicker
    const handleDateChange = (field, date, dateString) => {
        setBoqInfo((prev) => ({ ...prev, [field]: date ? date.toDate() : null }));
    };

    // Handle table row changes with auto-computation of total
    const handleTableChange = (record, field, value) => {
        const updatedItems = boqItems.map((item) => {
            if (item.boq_item_id === record.boq_item_id) {
                const updatedItem = { ...item, [field]: value };
                // Auto-compute total if quantity or unitPrice changes
                if (field === 'quantity' || field === 'unitPrice') {
                    const quantity = parseFloat(updatedItem.quantity) || 0;
                    const unitPrice = parseFloat(updatedItem.unitPrice) || 0;
                    updatedItem.total = (quantity * unitPrice).toFixed(2);
                }
                return updatedItem;
            }
            return item;
        });
        setBoqItems(updatedItems);
    };

    // Load material data when selecting from dropdown
    const loadMaterialData = (materialId, record) => {
        const material = materials.find((m) => m.id === materialId);
        if (material) {
            const updatedItems = boqItems.map((item) =>
                item.boq_item_id === record.boq_item_id
                    ? {
                        ...item,
                        material_id: materialId,
                        weight: material.spec.weight_per_unit || 0,
                        unit: material.base_unit || 'kgs',
                        unitPrice: 0, // You can fetch this from inv_material_prices if needed
                        total: 0,
                    }
                    : item
            );
            setBoqItems(updatedItems);
        }
    };

    // Columns for the table (smaller size)
    const columns = [
        {
            title: 'Material',
            dataIndex: 'material_id',
            key: 'material_id',
            render: (materialId, record) => (
                <Select
                    showSearch
                    placeholder="Select material"
                    optionFilterProp="children"
                    onChange={(value) => loadMaterialData(value, record)}
                    value={materialId}
                    style={{ width: 150 }} // Reduced width for compactness
                >
                    {materials.map((material) => (
                        <Option key={material.id} value={material.id}>
                            {material.description}
                        </Option>
                    ))}
                </Select>
            ),
        },
        {
            title: 'Specs',
            dataIndex: 'specifications',
            key: 'specifications',
            render: (text, record) => record.material_id && materials.find((m) => m.id === record.material_id)?.description,
            width: 100, // Reduced width for compactness
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleTableChange(record, 'quantity', e.target.value)}
                    type="number"
                    size="small" // Smaller input for compactness
                    style={{ width: 80 }} // Reduced width
                />
            ),
            width: 80,
        },
        {
            title: 'Unit',
            dataIndex: 'unit',
            key: 'unit',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleTableChange(record, 'unit', e.target.value)}
                    size="small"
                    style={{ width: 80 }} // Reduced width
                />
            ),
            width: 80,
        },
        {
            title: 'Weight (KG)',
            dataIndex: 'weight',
            key: 'weight',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleTableChange(record, 'weight', e.target.value)}
                    disabled
                    size="small"
                    style={{ width: 80 }} // Reduced width
                />
            ),
            width: 80,
        },
        {
            title: 'Unit Price (₹)',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleTableChange(record, 'unitPrice', e.target.value)}
                    type="number"
                    size="small"
                    style={{ width: 80 }} // Reduced width
                />
            ),
            width: 80,
        },
        {
            title: 'Total (₹)',
            dataIndex: 'total',
            key: 'total',
            render: (text, record) => (
                <Input
                    value={text}
                    disabled
                    size="small"
                    style={{ width: 80 }} // Reduced width
                />
            ),
            width: 80,
        },
    ];

    // Add new row to table
    const addRow = () => {
        setBoqItems([
            ...boqItems,
            { boq_item_id: `temp-${Date.now()}`, material_id: null, quantity: '', unit: '', weight: 0, unitPrice: 0, total: 0 },
        ]);
    };

    // Handle saving BOQ and its items in a single operation
    const handleSaveAll = async (values) => {
        if (!boqInfo.client) {
            Modal.error({ content: 'Please enter Client.' });
            return;
        }
        setLoading(true);
        try {
            // Step 1: Create BOQ entry with info
            const { data: boq, error: boqError } = await supabase
                .from('boq')
                .insert([{ details: boqInfo }])
                .select('id')
                .single();
            if (boqError) throw boqError;

            const boqId = boq.id;

            // Step 2: Save BOQ items with the generated boq_id
            const itemsToSave = boqItems.map((item) => ({
                boq_id: boqId,
                material_id: item.material_id,
                quantity: { qty: item.quantity, unit: item.unit },
                metadata: { weight: item.weight, unitPrice: item.unitPrice, total: item.total },
            }));

            const { error: itemsError } = await supabase.from('boq_items').insert(itemsToSave);
            if (itemsError) throw itemsError;

            // Reset form and items after successful save
            setBoqInfo({
                client: '',
                jobNo: '',
                date: null,
                drgNo: '',
                revDate: null,
                verifiedBy: '',
                verifiedDate: null,
            });
            setBoqItems([]);
            Modal.success({ content: 'BOQ and items saved successfully!' });
        } catch (error) {
            console.error('Error saving BOQ and items:', error);
            Modal.error({ content: 'Failed to save BOQ and items.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 16 }}> {/* Reduced padding for compactness */}
            <Form onFinish={handleSaveAll} layout="vertical">
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 8 }}> {/* Reduced font size and margin */}
                    FORESIGHT ROOFINGS LLP
                </div>

                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={6} lg={6}> {/* Responsive columns: 24 on xs, 12 on sm, 6 on md/lg */}
                        <Form.Item
                            label="CLIENT"
                            validateStatus={boqInfo.client ? '' : 'error'}
                            help={boqInfo.client ? '' : 'Please enter Client'}
                        >
                            <Input
                                value={boqInfo.client}
                                onChange={(e) => handleInfoChange('client', e.target.value)}
                                size="small" // Smaller input for compactness
                                placeholder="Enter Client"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Form.Item label="JOB NO">
                            <Input
                                value={boqInfo.jobNo}
                                onChange={(e) => handleInfoChange('jobNo', e.target.value)}
                                size="small"
                                placeholder="Enter Job No"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Form.Item label="DATE">
                            <DatePicker
                                value={boqInfo.date ? moment(boqInfo.date) : null}
                                onChange={(date, dateString) => handleDateChange('date', date, dateString)}
                                format="DD/MM/YYYY"
                                size="small" // Smaller input for compactness
                                placeholder="Select Date"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Form.Item label="DRG.NO">
                            <Input
                                value={boqInfo.drgNo}
                                onChange={(e) => handleInfoChange('drgNo', e.target.value)}
                                size="small"
                                placeholder="Enter Drawing No"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Form.Item label="REV. DATE">
                            <DatePicker
                                value={boqInfo.revDate ? moment(boqInfo.revDate) : null}
                                onChange={(date, dateString) => handleDateChange('revDate', date, dateString)}
                                format="DD/MM/YYYY"
                                size="small"
                                placeholder="Select Revision Date"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6}>
                        <Form.Item label="Verified By">
                            <Input
                                value={boqInfo.verifiedBy}
                                onChange={(e) => handleInfoChange('verifiedBy', e.target.value)}
                                size="small"
                                placeholder="Enter Verified By"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12}> {/* Wider for larger screens to fit the last row nicely */}
                        <Form.Item label="Verified Date">
                            <DatePicker
                                value={boqInfo.verifiedDate ? moment(boqInfo.verifiedDate) : null}
                                onChange={(date, dateString) => handleDateChange('verifiedDate', date, dateString)}
                                format="DD/MM/YYYY"
                                size="small"
                                placeholder="Select Verified Date"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ marginTop: 8 }}> {/* Reduced margin for compactness */}
                    <Button onClick={addRow} size="small" style={{ marginBottom: 8 }}>
                        Add Item
                    </Button>
                    <Table
                        columns={columns}
                        dataSource={boqItems}
                        rowKey="boq_item_id"
                        pagination={false}
                        size="small" // Smaller table size
                        style={{ marginBottom: 8 }} // Reduced margin
                    />
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="small" // Smaller button for compactness
                        style={{ marginTop: 8 }} // Reduced margin
                    >
                        Save
                    </Button>
                </div>
            </Form>
        </div>
    );
};


export default BOQForm;