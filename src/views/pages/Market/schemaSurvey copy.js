export const schema = {
    "logoPosition": "right",
    "pages": [
        {
            "name": "page0",
            "elements": [
                {
                    "type": "panel",
                    "name": "panel1",
                    "elements": [
                        {
                            "type": "html",
                            "name": "income_intro",
                            "html": "<article class='intro'>    <h1 class='intro__heading intro__heading--income title'>                     Income              </h1>    <div class='intro__body wysiwyg'>       <p>In this section, you will be asked about your current employment and any other way you and your partner currently receive income.</p>       <p>It will be handy to have the following in front of you:</p>       <ul>          <li>            Payslip (for employment details)          </li>          <li>            <p>A current Centrelink Schedule for any account based pension from super, annuities, or other income stream products that you own</p>            <p>              If you don't have a current one you can get these schedules by contacting your income stream provider            </p>          </li>          <li>            Latest statement from any payments (from Centrelink or other authority)          </li>       </ul>         </div> </article>"
                        }
                    ]
                }
            ]
        },
        {
            "name": "page1",
            "elements": [
                {
                    "type": "panel",
                    "name": "panel13",
                    "elements": [
                        {
                            "type": "radiogroup",
                            "name": "maritalstatus_c",
                            "title": " ",
                            "choices": [
                                "Married",
                                "In a registered relationship",
                                "Living with my partner",
                                "Widowed",
                                "Single"
                            ]
                        }
                    ],
                    "title": "What is your marital status?"
                }
            ]
        },
        {
            "name": "page2",
            "elements": [
                {
                    "type": "panel",
                    "name": "panel5",
                    "elements": [
                        {
                            "type": "panel",
                            "name": "panel2",
                            "elements": [
                                {
                                    "type": "radiogroup",
                                    "name": "member_receives_income_from_employment",
                                    "title": " ",
                                    "isRequired": true,
                                    "choices": [
                                        {
                                            "value": "1",
                                            "text": "Yes"
                                        },
                                        {
                                            "value": "0",
                                            "text": "No"
                                        }
                                    ],
                                    "colCount": 2
                                },
                                {
                                    "type": "checkbox",
                                    "name": "member_type_of_employment",
                                    "visible": false,
                                    "visibleIf": "{member_receives_income_from_employment} =1",
                                    "title": "  ",
                                    "isRequired": true,
                                    "choices": [
                                        "Self employment",
                                        "All other types of employment"
                                    ]
                                }
                            ],
                            "title": "You"
                        },
                        {
                            "type": "panel",
                            "name": "panel1",
                            "elements": [
                                {
                                    "type": "radiogroup",
                                    "name": "partner_receives_income_from_employment",
                                    "title": " ",
                                    "isRequired": true,
                                    "choices": [
                                        {
                                            "value": "1",
                                            "text": "Yes"
                                        },
                                        {
                                            "value": "0",
                                            "text": "No"
                                        }
                                    ],
                                    "colCount": 2
                                },
                                {
                                    "type": "checkbox",
                                    "name": "partner_type_of_employment",
                                    "visible": false,
                                    "visibleIf": "{partner_receives_income_from_employment} =1",
                                    "title": " ",
                                    "isRequired": true,
                                    "choices": [
                                        "Self employment",
                                        "All other types of employment"
                                    ]
                                }
                            ],
                            "visible": false,
                            "visibleIf": "{maritalstatus_c} = 'Married' or {maritalstatus_c} = 'In a registered relationship' or {maritalstatus_c} = 'Living with my partner'",
                            "title": "Your Partner",
                            "startWithNewLine": false
                        }
                    ],
                    "title": "Do you and/or your partner currently receive income from employment?"
                }
            ]
        },
        {
            "name": "page3.1",
            "elements": [
                {
                    "type": "panel",
                    "name": "panel6",
                    "elements": [
                        {
                            "type": "panel",
                            "name": "panel2",
                            "elements": [
                                {
                                    "type": "paneldynamic",
                                    "name": "member_arrray_employer_names",
                                    "title": "Please enter all your employers",
                                    "valueName": "member_arrray_employer",
                                    "templateElements": [
                                        {
                                            "type": "text",
                                            "name": "member_employer_name",
                                            "title": "Name of employer",
                                            "valueName": "name"
                                        }
                                    ],
                                    "panelCount": 1,
                                    "minPanelCount": 1,
                                    "panelAddText": "Add another employer"
                                }
                            ],
                            "visible": false,
                            "visibleIf": "{member_type_of_employment} contains 'All other types of employment'",
                            "title": "You"
                        },
                        {
                            "type": "panel",
                            "name": "panel8",
                            "elements": [
                                {
                                    "type": "paneldynamic",
                                    "name": "partner_arrray_employer_names",
                                    "title": "Please enter all your partner employers",
                                    "valueName": "partner_arrray_employer",
                                    "templateElements": [
                                        {
                                            "type": "text",
                                            "name": "partner_employer_name",
                                            "title": "Name of employer",
                                            "valueName": "name"
                                        }
                                    ],
                                    "panelCount": 1,
                                    "minPanelCount": 1,
                                    "panelAddText": "Add another employer"
                                }
                            ],
                            "visible": false,
                            "visibleIf": "{partner_type_of_employment} contains 'All other types of employment'",
                            "title": "Your Partner",
                            "startWithNewLine": false
                        }
                    ],
                    "title": "Who are you employed by?"
                }
            ],
            "visible": false,
            "visibleIf": "{member_type_of_employment} contains 'All other types of employment' or {partner_type_of_employment} contains 'All other types of employment'"
        },
        {
            "name": "page3.2",
            "elements": [
                {
                    "type": "panel",
                    "name": "panel16",
                    "elements": [
                        {
                            "type": "panel",
                            "name": "panel17",
                            "elements": [
                                {
                                    "type": "paneldynamic",
                                    "name": "member_arrray_employer_info",
                                    "title": "Your employers",
                                    "valueName": "member_arrray_employer",
                                    "templateElements": [
                                        {
                                            "type": "panel",
                                            "name": "panel_member_employer_address",
                                            "elements": [
                                                {
                                                    "type": "text",
                                                    "name": "member_employer_address",
                                                    "title": "Address",
                                                    "valueName": "address"
                                                },
                                                {
                                                    "type": "text",
                                                    "name": "member_employer_phone",
                                                    "title": "Phone number:",
                                                    "valueName": "phone"
                                                },
                                                {
                                                    "type": "text",
                                                    "name": "member_employer_abn",
                                                    "title": "ABN",
                                                    "valueName": "abn"
                                                }
                                            ],
                                            "title": "Address"
                                        },
                                        {
                                            "type": "panel",
                                            "name": "panel_member_employer_role",
                                            "elements": [
                                                {
                                                    "type": "radiogroup",
                                                    "name": "member_employer_role",
                                                    "title": "Your role",
                                                    "valueName": "role",
                                                    "choices": [
                                                        "Full time",
                                                        "Part time",
                                                        "Casual",
                                                        "Seasonal"
                                                    ]
                                                }
                                            ],
                                            "title": "What is your role?"
                                        },
                                        {
                                            "type": "panel",
                                            "name": "panel_member_employer_hours_work",
                                            "elements": [
                                                {
                                                    "type": "text",
                                                    "name": "member_employer_hours_worked",
                                                    "title": "Hours:",
                                                    "valueName": "hours_worked",
                                                    "inputType": "number"
                                                },
                                                {
                                                    "type": "dropdown",
                                                    "name": "member_employer_hours_worked_frequency",
                                                    "startWithNewLine": false,
                                                    "title": "Worked Frequency:",
                                                    "valueName": "hours_worked_frequency",
                                                    "defaultValue": "Year",
                                                    "choices": [
                                                        "Day",
                                                        "Week",
                                                        "Fortnight",
                                                        "Month",
                                                        "Year"
                                                    ]
                                                }
                                            ],
                                            "title": "What hours do you work?"
                                        },
                                        {
                                            "type": "panel",
                                            "name": "panel_member_employer_income",
                                            "elements": [
                                                {
                                                    "type": "text",
                                                    "name": "member_employer_income",
                                                    "title": "Income:",
                                                    "valueName": "income",
                                                    "inputType": "number"
                                                },
                                                {
                                                    "type": "dropdown",
                                                    "name": "member_employer_income_frequency",
                                                    "startWithNewLine": false,
                                                    "title": "Income Frequency",
                                                    "valueName": "income_frequency",
                                                    "defaultValue": "Year",
                                                    "choices": [
                                                        "Day",
                                                        "Week",
                                                        "Fortnight",
                                                        "Month",
                                                        "Year"
                                                    ]
                                                }
                                            ],
                                            "title": "What income do you receive?"
                                        }
                                    ],
                                    "templateTitle": "Employer name: {panel.name}",
                                    "allowAddPanel": false,
                                    "allowRemovePanel": false,
                                    "panelCount": 1,
                                    "renderMode": "progressTop"
                                }
                            ],
                            "visibleIf": "{member_type_of_employment} contains 'All other types of employment'",
                            "title": "You"
                        },
                        {
                            "type": "panel",
                            "name": "panel18",
                            "elements": [
                                {
                                    "type": "paneldynamic",
                                    "name": "partner_arrray_employer_info",
                                    "title": "Your partner employers",
                                    "valueName": "partner_arrray_employer",
                                    "templateElements": [
                                        {
                                            "type": "panel",
                                            "name": "panel_partner_employer_address",
                                            "elements": [
                                                {
                                                    "type": "text",
                                                    "name": "partner_employer_address",
                                                    "title": "Address:",
                                                    "valueName": "address"
                                                },
                                                {
                                                    "type": "text",
                                                    "name": "partner_employer_phone",
                                                    "title": "Phone number",
                                                    "valueName": "phone"
                                                },
                                                {
                                                    "type": "text",
                                                    "name": "partner_employer_abn",
                                                    "title": "ABN",
                                                    "valueName": "abn"
                                                }
                                            ],
                                            "title": "Address"
                                        },
                                        {
                                            "type": "panel",
                                            "name": "panel_partner_employer_role",
                                            "elements": [
                                                {
                                                    "type": "radiogroup",
                                                    "name": "partner_employer_role",
                                                    "title": "Your role",
                                                    "valueName": "role",
                                                    "choices": [
                                                        "Full time",
                                                        "Part time",
                                                        "Casual",
                                                        "Seasonal"
                                                    ]
                                                }
                                            ],
                                            "title": "What is your role?"
                                        },
                                        {
                                            "type": "panel",
                                            "name": "panel_partner_employer_hours_work",
                                            "elements": [
                                                {
                                                    "type": "text",
                                                    "name": "partner_employer_hours_worked",
                                                    "title": "Hours",
                                                    "valueName": "hours_worked",
                                                    "inputType": "number"
                                                },
                                                {
                                                    "type": "dropdown",
                                                    "name": "partner_employer_hours_worked_frequency",
                                                    "startWithNewLine": false,
                                                    "title": "Worked Frequency:",
                                                    "valueName": "hours_worked_frequency",
                                                    "defaultValue": "Year",
                                                    "choices": [
                                                        "Day",
                                                        "Week",
                                                        "Fortnight",
                                                        "Month",
                                                        "Year"
                                                    ]
                                                }
                                            ],
                                            "title": "What hours do you work?"
                                        },
                                        {
                                            "type": "panel",
                                            "name": "panel_partner_employer_income",
                                            "elements": [
                                                {
                                                    "type": "text",
                                                    "name": "partner_employer_income",
                                                    "title": "Income:",
                                                    "valueName": "income",
                                                    "inputType": "number"
                                                },
                                                {
                                                    "type": "dropdown",
                                                    "name": "partner_employer_income_frequency",
                                                    "startWithNewLine": false,
                                                    "title": "Income frequency:",
                                                    "valueName": "income_frequency",
                                                    "defaultValue": "Year",
                                                    "choices": [
                                                        "Day",
                                                        "Week",
                                                        "Fortnight",
                                                        "Month",
                                                        "Year"
                                                    ]
                                                }
                                            ],
                                            "title": "What income do you receive?"
                                        }
                                    ],
                                    "templateTitle": "Employer name: {panel.name}",
                                    "allowAddPanel": false,
                                    "allowRemovePanel": false,
                                    "panelCount": 1,
                                    "renderMode": "progressTop"
                                }
                            ],
                            "visibleIf": "{partner_type_of_employment} contains 'All other types of employment'",
                            "title": "You partner",
                            "startWithNewLine": false
                        }
                    ],
                    "title": "Tells us about your employer(s)"
                }
            ],
            "visibleIf": "{member_type_of_employment} contains 'All other types of employment' or {partner_type_of_employment} contains 'All other types of employment'"
        },
    ],
    "showQuestionNumbers": "off",
    "storeOthersAsComment": false,
    "pagePrevText": "Previous",
    "pageNextText": "Continue",
    "completeText": "Finish",
    "requiredText": ""
}