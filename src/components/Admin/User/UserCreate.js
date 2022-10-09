import * as React from 'react';
import { Create, SimpleForm, TextInput, useNotify } from 'react-admin';

export default function UserCreate() {
  const notify = useNotify();
  const onError = (error) => {
    notify(`Could not create user: ${error.response.data.detail}`);
  };

  return (
    <Create redirect="list" mutationOptions={{ onError }}>
      <SimpleForm>
        <TextInput required source="email" />
        <TextInput required source="password" />
      </SimpleForm>
    </Create>
  );
}
