import React from "react";
import { Form } from "@rjsf/antd";
import { Table, Button, Input, InputNumber, Select, Row, Col } from "antd";
import validator from "@rjsf/validator-ajv8";

const { Option } = Select;

// // Define the custom ArrayFieldTemplate
// const CustomArrayFieldTemplate = (props) => {
//     const columns = Object.keys(props.schema.items.properties).map((key) => ({
//         title: props.schema.items.properties[key].title || key,
//         dataIndex: key,
//         key,
//         render: (text, record, index) => {
//             // Find the specific field component for each row item
//             const field = props.items[index].children.find(
//                 (child) => child.props.name.endsWith(key)
//             );

//             // Render as an AntD Input or InputNumber based on field type
//             if (props.schema.items.properties[key].type === "number") {
//                 return <InputNumber {...field.props} />;
//             }
//             return <Input {...field.props} />;
//         }
//     }));

//     // Add a delete column for removing items
//     columns.push({
//         title: "Actions",
//         key: "actions",
//         render: (text, record, index) => (
//             <Button onClick={() => props.onDropIndexClick(index)} danger>
//                 Delete
//             </Button>
//         ),
//     });

//     return (
//         <div>
//             {/* <Table
//                 dataSource={props.items.map((item, index) => ({
//                     ...item.data,
//                     key: index,
//                 }))}
//                 columns={columns}
//                 pagination={false}
//             /> */}
//             <div style={{ color: 'red' }}> ter</div>
//             <Button type="dashed" onClick={props.onAddClick} style={{ marginTop: 16 }}>
//                 Add Item
//             </Button>
//         </div>
//     );
// };

// const schema = {
//     type: "object",
//     properties: {
//         items: {
//             type: "array",
//             title: "Items",
//             items: {
//                 type: "object",
//                 properties: {
//                     name: { type: "string", title: "Name" },
//                     age: { type: "number", title: "Age" },
//                 },
//             },
//         },
//     },
// };



// const schema = {
//     type: "array",
//     title: "A multiple-choice list",
//     items: {
//         type: "string",
//     },
// };
// const uiSchema = {
//     "ui:widget": "CustomSelect"
// };
const schema = {
    "type": "object",
    "title": "Holiday Form",
    "required": ["name", "pin", "address", "holidays", "leave_policy"],
    "properties":
    {
        "pin": { "type": "string", "title": "PIN", "default": "" },
        "name": { "type": "string", "title": "Name", "default": "" },
        "address": { "type": "string", "title": "Address", "default": "" },
        "holidays": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["holiday_name", "date", "day"],
                "properties": {
                    "day": { "type": "string", "title": "Day" },
                    "date": { "type": "string", "title": "Date" },
                    "optional": { "type": "boolean", "title": "Optional" },
                    "holiday_name": { "type": "string", "title": "Holiday Name" }
                }
            },
            "title": "Holidays"
        },
        "leave_policy": { "type": "object", "required": ["leaves", "sickleaves"], "properties": { "leaves": { "type": "integer", "title": "Annual Leaves" }, "sickleaves": { "type": "integer", "title": "Sick Leaves" } } }
    },
    "description": "A form to capture holiday and leave policy details."
}

const uiSchema = {
    "pin": {
        "ui:placeholder": "Enter your PIN"
    },
    "address": {
        "ui:placeholder": "Enter your address",
        // 'ui:widget': 'CustomSelect',
    },
    "holidays": {
        "items": {
            "day": {
                "ui:widget": "select",
                "ui:options": {
                    "enumOptions": [
                        {
                            "label": "Monday",
                            "value": "Monday"
                        },
                        {
                            "label": "Tuesday",
                            "value": "Tuesday"
                        },
                        {
                            "label": "Wednesday",
                            "value": "Wednesday"
                        },
                        {
                            "label": "Thursday",
                            "value": "Thursday"
                        },
                        {
                            "label": "Friday",
                            "value": "Friday"
                        },
                        {
                            "label": "Saturday",
                            "value": "Saturday"
                        },
                        {
                            "label": "Sunday",
                            "value": "Sunday"
                        }
                    ],
                    "placeholder": "Select Day"
                }
            },
            "date": {
                "ui:widget": "date"
            },
            "optional": {
                "ui:label": "Is this holiday optional?",
                "ui:widget": "checkbox"
            },
            "holiday_name": {
                "ui:widget": "text",
                "ui:placeholder": "Enter holiday name"
            }
        }
    },
    "leave_policy": {
        "leaves": {
            "ui:widget": "updown"
        },
        "sickleaves": {
            "ui:widget": "updown"
        }
    }
}

const CustomSelectComponent = props => {

    const totalFields = props.value.length;
    console.log("props", props);
    // Determine the number of columns based on the screen size
    const getColSpan = () => {
        if (totalFields <= 8) {
            return { xs: 24, sm: 12, md: 12, lg: Math.floor(24 / totalFields) }; // All fields in one row for lg
        }
        return { xs: 24, sm: 12, md: 12, lg: 3 }; // Adjust for more than 8 fields
    };

    return (
        <div className="">
            <Row >
                {props.value.map((item, index) => (
                    <Col key={index} {...getColSpan()}>
                        <Select id="custom-select" style={{ width: "100%" }}>
                            <Option value={item}>{item}</Option>
                        </Select>
                    </Col>
                ))}
                {/* <Col xs={6} sm={6} md={4} lg={3}>

                    <Select>
                        {props.value.map((item, index) => (
                            <Select.Option key={index} id="custom-select">
                                {item}
                            </Select.Option>
                        ))}
                    </Select>
                </Col>
                <Col xs={6} sm={6} md={4} lg={3}>
                    <Select>
                        {props.value.map((item, index) => (
                            <Select.Option key={index} id="custom-select">
                                {item}
                            </Select.Option>
                        ))}
                    </Select>
                </Col> */}
            </Row>
        </div>
    );
};

const widgets = {
    CustomSelect: CustomSelectComponent,
}

// function ArrayFieldTemplate(props) {
//     return (
//         <div>
//             {props.items.map(element => element.children)}
//             {props.canAdd && <button type="button" onClick={props.onAddClick}>TY</button>}
//         </div>
//     );
// }

const ArrayFieldTemplate = (props) => {
    return (
        <div>
            <Row gutter={[16, 16]}>
                {props.items.map((element, index) => (
                    <Col span={24} key={element.key}>
                        <h2>rt</h2>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ flexGrow: 1 }}>{element.children}</div>
                            {props.canRemove && (
                                <Button
                                    onClick={element.onDropIndexClick(index)}
                                    danger
                                    style={{ marginLeft: '8px' }}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    </Col>
                ))}
            </Row>
            {props.canAdd && (
                <Button type="dashed" onClick={props.onAddClick} style={{ marginTop: 16 }}>
                    Add Item
                </Button>
            )}
        </div>
    );
};

// const schema = {
//     type: "array",
//     items: {
//         type: "string"
//     }
// };

const App = () => (
    <Form schema={schema} validator={validator}
        uiSchema={uiSchema}
        // widgets={widgets}
        ArrayFieldTemplate={ArrayFieldTemplate}
    />
);

export default App;
