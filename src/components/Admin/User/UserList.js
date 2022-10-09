import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  NumberField,
  TopToolbar,
  ExportButton,
  TextInput,
  CreateButton,
} from 'react-admin';

const ListActions = () => (
  <TopToolbar>
    <ExportButton />
    <CreateButton />
  </TopToolbar>
);

const userFilters = [<TextInput label="Search" source="q" alwaysOn />];
export default function UserList() {
  return (
    <List actions={<ListActions />} filters={userFilters}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="email" />
        <TextField source="name" />
        <TextField source="wechatId" label="WechatId" />
        <TextField source="gender" />
        <NumberField source="contact_number" />
        <TextField source="current_address" />
        <DateField source="birthday" />
        <BooleanField source="public" />
        <TextField source="role" />
      </Datagrid>
    </List>
  );
}
