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
  const intervalDoubleDomainRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [resDataId, setResDataId] = useState(null);

  const reactAdminSignOut = async () => {
    await signOut();
    setCurrentUserId(null); // after signing out, we need to reset the currentUserId to null
    setResDataId(null); // after signing out, we need to reset the resDataId to null
    window.location.reload();
  };

  // Workaround for two sites sharing cookie
  useEffect(() => {
    const abortControllerRefCurrent = abortControllerRef.current;
    const helper = async () => {
      if (!intervalDoubleDomainRef.current) {
        intervalDoubleDomainRef.current = setInterval(async () => {
          let res = await getCurrentUser(abortControllerRefCurrent);
          if (res?.status === 200 && res?.data.role !== 'admin') {
            await reactAdminSignOut();
          } else if (res?.status === 200) {
            setResDataId(res?.data.id);
            setLoading(false);
          }
        }, 3000);
      }
    };
    helper();
    return () => {
      abortControllerRefCurrent.abort();
      clearInterval(intervalDoubleDomainRef.current);
    };
  }, []);

  useEffect(() => {
    const helper = async () => {
      if (!currentUserId) {
        setCurrentUserId(resDataId);
      } else if (currentUserId !== resDataId) {
        await reactAdminSignOut();
      }
    };
    helper();
  }, [currentUserId, resDataId]);
  // End workaround for two sites sharing cookie

  // useEffect(() => {
  //   const abortControllerRefCurrent = abortControllerRef.current;
  //   const wrapper = async () => {
  //     let res = await getCurrentUser(abortControllerRefCurrent);
  //     if (res?.status !== 200 || res?.data.role !== 'admin') {
  //       await reactAdminSignOut();
  //     }
  //     setLoading(false);
  //     setCurrentUserId(res?.data.id);
  //   };
  //   wrapper();
  //   return () => {
  //     abortControllerRefCurrent.abort();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!currentUserId) return;
  //   const abortControllerRefCurrent = abortControllerRef.current;
  //   if (!intervalRef.current) {
  //     intervalRef.current = setInterval(async () => {
  //       if (await doesSessionExist()) {
  //         const res = await getCurrentUser(abortControllerRefCurrent);
  //         if (currentUserId !== res?.data.id) {
  //           await reactAdminSignOut();
  //         }
  //       }
  //     }, 3000);
  //   }
  //   return () => {
  //     abortControllerRefCurrent.abort();
  //     clearInterval(intervalRef.current);
  //   }; //test
  // }, [currentUserId]);

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
