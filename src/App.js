import AdminBase from './components/Admin/Admin';

import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react';
import ThirdPartyEmailPassword, {
  signOut,
} from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import Session from 'supertokens-auth-react/recipe/session';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import { useCallback, useEffect, useRef } from 'react';
import { keepLambdaWarm } from './network/lib/lambda';
import { useIdleTimer } from 'react-idle-timer';

SuperTokens.init({
  appInfo: {
    // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
    appName: 'SportsConnectAdmin',
    apiDomain: process.env.REACT_APP_API_AUTH_URL,
    websiteDomain: process.env.REACT_APP_APP_URL,
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdPartyEmailPassword.init({
      style: {
        button: {
          backgroundColor: '#0076ff',
          border: '0px',
          margin: '0 auto',
        },
        superTokensBranding: {
          display: 'none',
        },
        secondaryText: {
          display: 'none',
        },
      },
    }),
    EmailVerification.init({
      mode: process.env.REACT_APP_EMAIL_VERIFICATION,
    }),
    Session.init({ cookieDomain: process.env.REACT_APP_COOKIE_DOMAIN }),
  ],
});

function App() {
  const reactAdminSignOut = useCallback(async () => {
    await signOut();
    window.location.reload();
  }, []);

  // Workaround for Lambda warm start (probably dont need this since we are executing getCurrentUser every 3 seconds)
  const intervalRef = useRef(null); // we use a ref and not a variable because variables get reassigned (therefore creating another timer) upon rerender
  const startLambdaAndKeepWarm = () => {
    keepLambdaWarm(); // initial warm up
    intervalRef.current = setInterval(keepLambdaWarm, 1000 * 60 * 5); // warm up every 5 mins
  };

  const handleOnIdle = () => {
    clearInterval(intervalRef.current);
  };

  useIdleTimer({
    timeout: 1000 * 60, // User is considered idle after 1 minute of inactivity
    onIdle: handleOnIdle,
    onActive: startLambdaAndKeepWarm,
  });

  useEffect(() => {
    startLambdaAndKeepWarm();
  }, []);
  // End workaround for Lambda warm start

  if (SuperTokens.canHandleRoute()) {
    // This renders the login UI on the /auth route
    return SuperTokens.getRoutingComponent();
  }

  return (
    <SuperTokensWrapper>
      <AdminBase reactAdminSignOut={reactAdminSignOut} />
    </SuperTokensWrapper>
  );
}

export default App;
