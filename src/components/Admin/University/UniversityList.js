import {
  List,
  Datagrid,
  TextField,
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
export default function UniversityList() {
  return (
    <List actions={<ListActions />} filters={userFilters}>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="city" />
        <TextField source="state" />
        <TextField source="conference" />
        <TextField source="division" />
        <TextField source="region" />
        <TextField source="category" />
      </Datagrid>
    </List>
  );
}
