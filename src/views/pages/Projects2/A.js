import React from 'react';
import Form from '@rjsf/core';
import { Button } from 'antd';
// import 'antd/dist/antd.css';
import validator from "@rjsf/validator-ajv8";

// Define a custom ArrayFieldTemplate component for Ant Design
const ArrayFieldTemplate = (props) => {
    return (
        <div className="custom-array-field">
            gt
            {/* <h3>{props.title}</h3>
            <div className="array-items">
                {props.items &&
                    props.items.map((element) => (
                        <div key={element.index} className="array-item">
                            <div>{element.children} fgf</div>
                            {element.hasRemove && (
                                <Button
                                    type="danger"
                                    onClick={element.onDropIndexClick(element.index)}
                                    style={{ marginTop: '8px' }}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
            </div>
            {props.canAdd && (
                <Button type="primary" onClick={props.onAddClick} style={{ marginTop: '16px' }}>
                    Add Item
                </Button>
            )} */}
        </div>
    );
};

// Define your JSON schema and UI schema
const schema = {
    type: "object",
    properties: {
        exampleArray: {
            type: "array",
            title: "Example Array",
            items: {
                type: "string",
                title: "Ite"
            }
        }
    }
};

function App() {
    return (
        <div className="App">
            <Form
                schema={schema}
                ArrayFieldTemplate={ArrayFieldTemplate} validator={validator}
            />
        </div>
    );
}

export default App;
