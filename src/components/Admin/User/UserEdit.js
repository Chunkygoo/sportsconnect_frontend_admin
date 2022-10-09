import * as React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  required,
  NumberInput,
  BooleanInput,
} from 'react-admin';

export default function UserEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput disabled label="Id" source="id" />
        <TextInput source="name" />
        <TextInput disabled source="email" />
        <TextInput source="wechatId" label="WechatId" />
        <TextInput source="gender" />
        <NumberInput source="contact_number" />
        <TextInput source="current_address" />
        <TextInput source="permanent_address" />
        <DateInput source="birthday" />
        <BooleanInput source="public" validate={required()} />
        <TextInput disabled source="role" validate={required()} />
      </SimpleForm>
    </Edit>
  );
}
