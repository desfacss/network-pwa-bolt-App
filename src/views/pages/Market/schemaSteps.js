// export const schemas = [
//     {
//         title: 'Step 1',
//         description: 'Personal Information',
//         type: 'object',
//         properties: {
//             category: {
//                 title: 'Category',
//                 type: 'string',
//                 enum: ['general', 'personal'],
//                 format: 'radio',
//                 enumNames: ['General', 'Personal']
//             },
//             name: {
//                 title: 'Name',
//                 type: 'string',
//                 default: 'John'
//             },
//             password: {
//                 title: 'Password',
//                 type: 'string',
//                 format: 'password'
//             },
//             gender: {
//                 enum: [
//                     'Male',
//                     'Female',
//                     'Other'
//                 ],
//                 title: 'Gender',
//                 type: 'string',
//                 format: 'radio',
//                 enumNames: [
//                     'M',
//                     'F',
//                     'O'
//                 ]
//             },
//             state: {
//                 enum: [
//                     'India',
//                     'USA',
//                     'England'
//                 ],
//                 title: 'State',
//                 type: 'string',
//                 format: 'select',
//                 enumNames: [
//                     'india',
//                     'usa',
//                     'england'
//                 ]
//             },
//             number: {
//                 title: 'Number',
//                 type: 'number',
//                 format: 'number'
//             },
//             email: {
//                 title: 'Email',
//                 type: 'string',
//                 format: 'email'
//             },
//             dob: {
//                 format: 'date',
//                 title: 'DOB',
//                 type: 'string'
//             },
//             owner: {
//                 title: 'Owner',
//                 type: 'boolean',
//                 format: 'checkbox'
//             }
//         },
//         dependencies: {
//             category: {
//                 oneOf: [
//                     {
//                         properties: {
//                             category: {
//                                 enum: ['general']
//                             },
//                             name: {
//                                 title: 'Name',
//                                 type: 'string',
//                                 default: 'John'
//                             },
//                             password: {
//                                 title: 'Password',
//                                 type: 'string',
//                                 format: 'password'
//                             }
//                         },
//                         required: ['name', 'password']
//                     },
//                     {
//                         properties: {
//                             category: {
//                                 enum: ['personal']
//                             },
//                             email: {
//                                 title: 'Email',
//                                 type: 'string',
//                                 format: 'email'
//                             },
//                             dob: {
//                                 format: 'date',
//                                 title: 'DOB',
//                                 type: 'string'
//                             }
//                         },
//                         required: ['email', 'dob']
//                     }
//                 ]
//             }
//         },
//         required: ['category'],
//         definitions: {}
//     },
//     {
//         title: 'Step 2',
//         description: 'Credentials',
//         properties: {
//             password: {
//                 title: 'Password',
//                 type: 'string',
//                 format: 'password'
//             },
//             confirmPassword: {
//                 title: 'Confirm Password',
//                 type: 'string',
//                 format: 'password'
//             },
//         },
//         required: ['password', 'confirmPassword'],
//         type: 'object'
//     }
// ];


export const schemas = [
    {
        title: 'Step 1',
        description: 'Personal Information',
        type: 'object',
        properties: {
            name: {
                title: 'name',
                type: 'string',
                default: 'John'
            },
            password: {
                title: 'password',
                type: 'string',
                format: 'password'
            },
            gender: {
                enum: [
                    'Male',
                    'Female',
                    'Other'
                ],
                title: 'Gender',
                type: 'string',
                format: 'radio',
                enumNames: [
                    'M',
                    'F',
                    'O'
                ]
            },
            state: {
                enum: [
                    'India',
                    'USA',
                    'England'
                ],
                title: 'State',
                type: 'string',
                format: 'select',
                enumNames: [
                    'india',
                    'usa',
                    'england'
                ]
            },
            number: {
                title: 'Number',
                type: 'number',
                format: 'number'
            },
            email: {
                title: 'Email',
                type: 'string',
                format: 'email'
            },
            dob: {
                format: 'date',
                title: 'DOB',
                type: 'string'
            },
            owner: {
                title: 'Owner',
                type: 'boolean',
                format: 'checkbox'
            }
        },
        dependencies: {},
        required: [
            'name',
            'password'
        ],
        definitions: {}
    },
    {
        title: 'Step 2',
        description: 'Credentials',
        properties: {
            password: {
                title: 'Password',
                type: 'string',
                format: 'password'
            },
            confirmPassword: {
                title: 'Confirm Password',
                type: 'string',
                format: 'password'
            },
        },
        required: ['password', 'confirmPassword'],
        type: 'object'
    },
    {
        title: 'Step 1',
        description: 'Personal Information',
        type: 'object',
        properties: {
            name: {
                title: 'name',
                type: 'string',
                default: 'John'
            },
            password: {
                title: 'password',
                type: 'string',
                format: 'password'
            },
            gender: {
                enum: [
                    'Male',
                    'Female',
                    'Other'
                ],
                title: 'Gender',
                type: 'string',
                format: 'radio',
                enumNames: [
                    'M',
                    'F',
                    'O'
                ]
            },
            state: {
                enum: [
                    'India',
                    'USA',
                    'England'
                ],
                title: 'State',
                type: 'string',
                format: 'select',
                enumNames: [
                    'india',
                    'usa',
                    'england'
                ]
            },
            number: {
                title: 'Number',
                type: 'number',
                format: 'number'
            },
            email: {
                title: 'Email',
                type: 'string',
                format: 'email'
            },
            dob: {
                format: 'date',
                title: 'DOB',
                type: 'string'
            },
            owner: {
                title: 'Owner',
                type: 'boolean',
                format: 'checkbox'
            }
        },
        dependencies: {},
        required: [
            'name',
            'password'
        ],
        definitions: {}
    },
    // Add more schemas as needed
];


// check: {
//     enum: [
//         'personal',
//         'general',
//     ],
//     title: 'type',
//     type: 'string',
//     format: 'radio',
//     enumNames: [
//         'personal',
//         'general',
//     ]
// },
//     password:{
//     title: 'password',
//     type: 'string',
//     format: 'password',
//     look:'personal'
// },
//     otp:{
//     title: 'password',
//     type: 'string',
//     format: 'password',
//     look:'personal'
// },
//     name:{
//     title: 'name',
//     type: 'string',
//     default: 'John',
//     look:'general'
// },
//     age:{
//     title: 'age',
//     type: 'number',
//     format: 'number',
//     look:'general'
// },


// export const schemas = [
//     {
//         title: 'Step 1',
//         description: 'Personal Information',
//         properties: {
//             name: {
//                 title: 'Name',
//                 type: 'string',
//                 default: 'John'
//             },
//             email: {
//                 title: 'Email',
//                 type: 'string',
//                 format: 'email'
//             }
//         },
//         required: ['name', 'email'],
//         type: 'object'
//     },
//     {
//         title: 'Step 2',
//         description: 'Credentials',
//         properties: {
//             password: {
//                 title: 'Password',
//                 type: 'string',
//                 format: 'password'
//             },
//             confirmPassword: {
//                 title: 'Confirm Password',
//                 type: 'string',
//                 format: 'password'
//             }
//         },
//         required: ['password', 'confirmPassword'],
//         type: 'object'
//     }
//     // Add more schemas as needed
// ];