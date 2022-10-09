import React, { useEffect, useRef, useState } from 'react';
import { Admin, Resource, UserMenu, AppBar, Layout } from 'react-admin';
import DataProvider from './Provider/DataProvider.ts';
import UserList from './User/UserList';
import UserEdit from './User/UserEdit';
import UserCreate from './User/UserCreate';
import UniversityList from './University/UniversityList';
import UniversityCreate from './University/UniversityCreate';
import UniversityEdit from './University/UniversityEdit';
import { SessionAuth, signOut } from 'supertokens-auth-react/recipe/session';
import MyLogoutButton from './MyLogoutButton';
import { getCurrentUser } from '../../network/lib/users';
import Spinner from '../Spinner';
import Dashboard from './Dashboard';

export default function AdminBase() {
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef(new AbortController());

  const dataProvider = DataProvider(process.env.REACT_APP_API_DATA_URL);
  const MyUserMenu = (props) => (
    <UserMenu {...props}>
      <MyLogoutButton />
    </UserMenu>
  );
  const MyAppBar = (props) => <AppBar {...props} userMenu={<MyUserMenu />} />;
  const MyLayout = (props) => <Layout {...props} appBar={MyAppBar} />;

  useEffect(() => {
    const abortControllerRefCurrent = abortControllerRef.current;
    const wrapper = async () => {
      let res = await getCurrentUser(abortControllerRefCurrent);
      if (res?.status !== 200 || res?.data.role !== 'admin') {
        await signOut();
        window.location.reload();
      }
      setLoading(false);
    };
    wrapper();
    return () => {
      abortControllerRefCurrent.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          Loading
          <Spinner size={10} />
        </div>
      </div>
    );
  }

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
