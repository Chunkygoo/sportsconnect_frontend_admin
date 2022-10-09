import AdminBase from './components/Admin/Admin';

import SuperTokens, { SuperTokensWrapper } from 'supertokens-auth-react';
import ThirdPartyEmailPassword from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import Session from 'supertokens-auth-react/recipe/session';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';

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
  if (SuperTokens.canHandleRoute()) {
    // This renders the login UI on the /auth route
    return SuperTokens.getRoutingComponent();
  }
  return (
    <SuperTokensWrapper>
      <AdminBase />
    </SuperTokensWrapper>
  );
}

export default App;
