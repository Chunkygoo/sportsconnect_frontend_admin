import React, { useEffect, useState } from 'react';
import { Admin, Resource, UserMenu, AppBar, Layout } from 'react-admin';
import DataProvider from './Provider/DataProvider.ts';
import UserList from './User/UserList';
import UserEdit from './User/UserEdit';
import UserCreate from './User/UserCreate';
import UniversityList from './University/UniversityList';
import UniversityCreate from './University/UniversityCreate';
import UniversityEdit from './University/UniversityEdit';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import MyLogoutButton from './UserMenuItems/MyLogoutButton';
import Spinner from '../Spinner';
import Dashboard from './Dashboard';
import LoggedInUserEmail from './UserMenuItems/LoggedInUserEmail';
import { getCurrentUser } from '../../network/lib/users';

export default function AdminBase({ reactAdminSignOut }) {
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const helper = async () => {
      let res = await getCurrentUser();
      if (res?.status === 200) {
        if (res?.data.role !== 'admin') {
          await reactAdminSignOut();
        } else {
          setLoggedInUser(res.data);
        }
      }
      setLoading(false);
    };
    helper();
  }, [reactAdminSignOut]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <SessionAuth>
            Loading
            <Spinner size={10} />
          </SessionAuth>
        </div>
      </div>
    );
  }

  const dataProvider = DataProvider(process.env.REACT_APP_API_DATA_URL);
  const MyUserMenu = (props) => (
    <UserMenu {...props}>
      <LoggedInUserEmail loggedInUserEmail={loggedInUser.email} />
      <MyLogoutButton reactAdminSignOut={reactAdminSignOut} />
    </UserMenu>
  );
  const MyAppBar = (props) => <AppBar {...props} userMenu={<MyUserMenu />} />;
  const MyLayout = (props) => <Layout {...props} appBar={MyAppBar} />;

  return (
    <SessionAuth>
      <Admin
        dataProvider={dataProvider}
        dashboard={Dashboard}
        loginPage={false}
        layout={MyLayout}
      >
        <Resource
          name="admin/users"
          options={{ label: 'Users' }}
          list={UserList}
          create={UserCreate}
          edit={UserEdit}
        />
        <Resource
          name="admin/universities"
          options={{ label: 'Universities' }}
          list={UniversityList}
          create={UniversityCreate}
          edit={UniversityEdit}
        />
      </Admin>
    </SessionAuth>
  );
}
