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

export const eventFormControls = [
  {
    label: 'Event Title',
    name: 'title',
    componentType: 'input',
    type: 'text',
    placeholder: 'Enter event title',
  },
  {
    label: 'Description',
    name: 'description',
    componentType: 'textarea',
    placeholder: 'Enter event description',
  },
  {
    label: 'Beach',
    name: 'beachId',
    componentType: 'select',
    placeholder: 'Select beach',
    options: [],
  },
  {
    label: 'Start Date & Time',
    name: 'startDate',
    componentType: 'input',
    type: 'datetime-local',
    placeholder: 'Select start date and time',
  },
  {
    label: 'End Date & Time',
    name: 'endDate',
    componentType: 'input',
    type: 'datetime-local',
    placeholder: 'Select end date and time',
  },
  {
    label: 'Max Volunteers',
    name: 'maxVolunteers',
    componentType: 'input',
    type: 'number',
    placeholder: 'Enter maximum number of volunteers',
  },
  {
    label: 'Tags (comma-separated)',
    name: 'tags',
    componentType: 'input',
    type: 'text',
    placeholder: 'e.g., environment, marine-life, community',
  },
];

export const agentFormControls = [
  {
    name: 'name',
    label: 'Full Name',
    placeholder: 'Enter agent name (firstname + lastname)',
    componentType: 'input',
    type: 'text',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'Enter agent email',
    componentType: 'input',
    type: 'email',
  },
  {
    name: 'nic',
    label: 'National ID (NIC)',
    placeholder: 'Enter agent NIC',
    componentType: 'input',
    type: 'text',
  },
  {
    name: 'assignedBeach',
    label: 'Assigned Beach',
    placeholder: 'Select beach',
    componentType: 'select',
    options: [],
  },
];
