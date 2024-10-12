export const schema2 = {
    "type": "object",
    "title": "Business Information",
    "required": [
    ],
    "properties": {
        "useDifferentEnum": {
            "type": "boolean",
            "title": "switch",
            "ui:order": 0 // Adjust order as needed
        },
        "industrySector": {
            "type": "string",
            "title": "Industry/Sector",
            "format": "select",
            "enum": "sector", // Default enum, will change dynamically based on switch value
            "ui:order": 4
        },
        // "extraField": {
        //     "type": "string",
        //     "title": "Additional Field",
        //     "ui:order": 4.5
        // },
        // Other properties here...
    },
    "dependencies": {
        "useDifferentEnum": {
            "oneOf": [
                {
                    "properties": {
                        "useDifferentEnum": {
                            "const": false
                        },
                        "industrySector": {
                            "enum": "sector" // Use "sector" enum when switch is false
                        }
                    }
                },
                {
                    "properties": {
                        "useDifferentEnum": {
                            "const": true
                        },
                        "industrySector": {
                            "enum": "structure" // Use "structure" enum when switch is true
                        },
                        "extraField": {
                            "type": "string",
                            "title": "Extra Field Shown When Switch is True"
                        }
                    }
                }
            ]
        }
    }
};
