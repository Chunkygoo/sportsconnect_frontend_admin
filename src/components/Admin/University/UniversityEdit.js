import * as React from 'react';
import { Edit, SimpleForm, TextInput } from 'react-admin';

export default function UniversityEdit() {
  return (
    <Edit>
      <SimpleForm>
        <TextInput disabled label="Id" source="id" />
        <TextInput source="name" />
        <TextInput source="city" />
        <TextInput source="state" />
        <TextInput source="conference" />
        <TextInput source="division" />
        <TextInput source="region" />
        <TextInput source="category" />
      </SimpleForm>
    </Edit>
  );
}
