import * as React from 'react';
import { Create, SimpleForm, TextInput, useNotify } from 'react-admin';

export default function UniversityCreate() {
  const notify = useNotify();
  const onError = (error) => {
    notify(`Could not create university: ${error.response.data.detail}`);
  };

  return (
    <Create redirect="list" mutationOptions={{ onError }}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="city" />
        <TextInput source="state" />
        <TextInput source="conference" />
        <TextInput source="division" />
        <TextInput source="region" />
        <TextInput source="category" />
      </SimpleForm>
    </Create>
  );
}
