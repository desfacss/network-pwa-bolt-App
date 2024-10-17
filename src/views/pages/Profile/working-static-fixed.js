import React, { useState } from "react";
import { Table, Input, Form, Typography } from "antd";
import './index.css'; // For custom styles

const { Text } = Typography;

// Editable cell component
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [form] = Form.useForm();
  const save = async () => {
    try {
      const values = await form.validateFields();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = (
      <Form form={form} component={false} initialValues={record}>
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `${title} is required.` }]}
        >
          <Input onBlur={save} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const Timesheet = () => {
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      name: "John Brown",
      borrow: 10,
      repayment: 33,
      interest: 5,
      fees: 3,
      penalty: 2,
      discount: 1,
      insurance: 6,
    },
    {
      key: "2",
      name: "Jim Green",
      borrow: 100,
      repayment: 0,
      interest: 7,
      fees: 4,
      penalty: 0,
      discount: 2,
      insurance: 10,
    },
    {
      key: "3",
      name: "Joe Black",
      borrow: 10,
      repayment: 10,
      interest: 2,
      fees: 1,
      penalty: 1,
      discount: 0,
      insurance: 2,
    },
    {
      key: "4",
      name: "Jim Red",
      borrow: 75,
      repayment: 45,
      interest: 9,
      fees: 5,
      penalty: 3,
      discount: 2,
      insurance: 7,
    },
  ]);

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData);
  };

  const defaultColumns = [
    {
      title: "Name",
      dataIndex: "name",
      fixed: "left",
      width: 300, // Fixed width for "Name" column
    },
    {
      title: "Borrow",
      dataIndex: "borrow",
      editable: true,
      width: 200, // Set width of all editable columns to 200px
    },
    {
      title: "Repayment",
      dataIndex: "repayment",
      editable: true,
      width: 200,
    },
    {
      title: "Interest",
      dataIndex: "interest",
      editable: true,
      width: 200,
    },
    {
      title: "Fees",
      dataIndex: "fees",
      editable: true,
      width: 200,
    },
    {
      title: "Penalty",
      dataIndex: "penalty",
      editable: true,
      width: 200,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      editable: true,
      width: 200,
    },
    {
      title: "Insurance",
      dataIndex: "insurance",
      editable: true,
      width: 200,
    },
    {
      title: "User Total",
      dataIndex: "userTotal",
      fixed: "right",
      width: 200, // Fixed width for "User Total" column
      render: (text, record) => {
        const total =
          record.borrow +
          record.repayment +
          record.interest +
          record.fees +
          record.penalty +
          record.discount +
          record.insurance;
        return <Text className="user-total">{total}</Text>; // Apply highlight class
      },
    },
  ];

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div style={{ overflowX: "auto" }}> {/* Container for horizontal scrolling */}
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        summary={(pageData) => {
          let totalBorrow = 0;
          let totalRepayment = 0;
          let totalInterest = 0;
          let totalFees = 0;
          let totalPenalty = 0;
          let totalDiscount = 0;
          let totalInsurance = 0;

          pageData.forEach(
            ({
              borrow,
              repayment,
              interest,
              fees,
              penalty,
              discount,
              insurance,
            }) => {
              totalBorrow += borrow;
              totalRepayment += repayment;
              totalInterest += interest;
              totalFees += fees;
              totalPenalty += penalty;
              totalDiscount += discount;
              totalInsurance += insurance;
            }
          );

          return (
            <>
              <Table.Summary.Row className="table-summary-row"> {/* Highlighted summary row */}
                <Table.Summary.Cell className="sticky-left" width={300}>
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell className="table-summary-cell">
                  <Text type="danger">{totalBorrow}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="table-summary-cell">
                  <Text>{totalRepayment}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="table-summary-cell">
                  <Text>{totalInterest}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="table-summary-cell">
                  <Text>{totalFees}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="table-summary-cell">
                  <Text>{totalPenalty}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="table-summary-cell">
                  <Text>{totalDiscount}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="table-summary-cell">
                  <Text>{totalInsurance}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="sticky-right" width={200}>
                  <Text type="danger">
                    {totalBorrow +
                      totalRepayment +
                      totalInterest +
                      totalFees +
                      totalPenalty +
                      totalDiscount +
                      totalInsurance}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row className="table-summary-row"> {/* Highlighted summary row */}
                <Table.Summary.Cell className="sticky-left" width={300}>
                  Balance
                </Table.Summary.Cell>
                <Table.Summary.Cell colSpan={7}>
                  <Text type="danger">{totalBorrow - totalRepayment}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell className="sticky-right" width={200}></Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
        scroll={{ x: 1800 }} // Enable horizontal scrolling
      />
    </div>
  );
};

export default Timesheet;
