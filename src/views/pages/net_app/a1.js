export const schema2 = {
    "type": "object",
    "title": "Business Information",
    "required": [
        "companyName",
        "industrySector",
        "legalStructure",
        "directEmployment",
        "annualTurnoverRange",
        "nagaratharInvolvement"
    ],
    "properties": {
        "web": {
            "type": "string",
            "title": "Website",
            "format": "link",
            "ui:order": 21.5
        },
        "posts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "title": "Name",
                        "ui:order": 1
                    },
                    "salary": {
                        "type": "number",
                        "title": "Salary",
                        "ui:order": 2
                    },
                    "experience": {
                        "type": "string",
                        "title": "Experience",
                        "ui:order": 3
                    }
                }
            },
            "title": "Posts",
            "is_repeatable": true
        },
        "section": {
            "type": "string",
            "title": "Business Description",
            "format": "section",
            "ui:order": 10,
            "description": "This information is Optional. You can add this info later as well, if you opt-in to list this business in KNBA Directory"
        },
        "twitter": {
            "type": "string",
            "title": "Twitter",
            "format": "link",
            "ui:order": 25
        },
        "facebook": {
            "type": "string",
            "title": "Facebook",
            "format": "link",
            "ui:order": 23
        },
        "linkedin": {
            "type": "string",
            "title": "Linkedin",
            "format": "link",
            "ui:order": 22
        },
        "location": {
            "type": "string",
            "title": "Main Location",
            "ui:order": 21
        },
        "section3": {
            "type": "string",
            "title": "Business Contact Information",
            "format": "section",
            "ui:order": 20,
            "description": "This information is Optional. You can add this info later as well, if you opt-in to list this business in KNBA Directory"
        },
        "instagram": {
            "type": "string",
            "title": "Instagram",
            "format": "link",
            "ui:order": 24
        },
        "subSector": {
            "type": "string",
            "title": "Sub Sector",
            "ui:order": 5
        },
        "companyName": {
            "type": "string",
            "title": "Company Name",
            "ui:order": 1
        },
        "positionTitle": {
            "type": "string",
            "title": "Your Position/Title",
            "ui:order": 2
        },
        "expansionPlans": {
            "type": "string",
            "title": "What type of expansion are you considering in the next 1-2 years?",
            "format": "textarea",
            "ui:order": 13
        },
        "industrySector": {
            "type": "string",
            "title": "Industry/Sector",
            "format": "select",
            "enum": "sector",
            // "enumNames": "industrySector",
            "ui:order": 4
        },
        "legalStructure": {
            "type": "string",
            "title": "Legal Structure of Business",
            "format": "select",
            "enum": "structure",
            // "enumNames": "legalStructure",
            "ui:order": 6
        },
        "innovationPlans": {
            "type": "string",
            "title": "What process or technology innovation are you planning in the near future?",
            "format": "textarea",
            "ui:order": 14
        },
        "briefDescription": {
            "type": "string",
            "title": "Brief Description of Your Business",
            "format": "textarea",
            "ui:order": 11
        },
        "directEmployment": {
            "type": "string",
            "title": "Direct Employment",
            "format": "select",
            "enum": "indirect_employment",
            "ui:order": 8,
            "description": "Approximate employment opportunity your business is creating"
        },
        "establishmentYear": {
            "type": "string",
            "title": "Year of Establishment",
            "ui:order": 6.1
        },
        "indirectEmployment": {
            "type": "string",
            "title": "Indirect Employment",
            "format": "select",
            "enum": "indirect_employment",
            "ui:order": 9,
            "description": "Approximate employment opportunity your business is creating"
        },
        "productsOrServices": {
            "type": "string",
            "title": "Brief Description of Products or Services Offered",
            "format": "textarea",
            "ui:order": 12
        },
        "annualTurnoverRange": {
            "type": "string",
            "title": "Annual Turnover Range",
            "format": "select",
            "enum": "annual_turnover",
            "ui:order": 7.1,
            "description": "Approximate turnover range to understand the Nagarathar community contribution to the nation building across each sector."
        },
        "nagaratharInvolvement": {
            "type": "string",
            "title": "Nagarathar Involvement",
            "format": "select",
            "enum": "ownership",
            "ui:order": 7,
            "description": "% of Nagarathar Founders/Owners share in the business"
        }
    }
}