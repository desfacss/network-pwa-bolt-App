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
      type: 'string'
    },
    gender: {
      enum: [
        'Male',
        'Female',
        'Other'
      ],
      title: 'Gender',
      type: 'string',
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
      enumNames: [
        'india',
        'usa',
        'england'
      ]
    },
    number: {
      title: 'Number',
      type: 'number'
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
      type: 'boolean'
    }
  },
  dependencies: {},
  required: [
    'name',
    'password'
  ],
  definitions: {}
}
