export const registerFormControls = [
  {
    name: 'name',
    label: 'Full Name',
    placeholder: 'Enter your name (firstname + lastname)',
    componentType: 'input',
    type: 'text',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    componentType: 'input',
    type: 'email',
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number',
    placeholder: 'Enter your phone number',
    componentType: 'phoneInput',
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    componentType: 'input',
    type: 'password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    placeholder: 'Re-enter your password',
    componentType: 'input',
    type: 'password',
  },
];

export const loginFormControls = [
  {
    name: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    componentType: 'input',
    type: 'email',
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    componentType: 'input',
    type: 'password',
  },
];

export const beachFormControls = [
  {
    label: 'Beach name',
    name: 'name',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter beach name',
  },
  {
    label: 'Address',
    name: 'address',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter beach address',
  },
  {
    label: 'Beach country',
    name: 'country',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter beach country',
  },
  {
    label: 'Beach city',
    name: 'city',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter beach city',
  },
  {
    label: 'Description',
    name: 'description',
    componentType: 'textarea',
    placeholder: 'Enter beach description',
  },
];
