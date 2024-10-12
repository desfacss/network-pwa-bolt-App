export const schema = {
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
}