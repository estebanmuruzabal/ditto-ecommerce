import React, { useContext, lazy, Suspense } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import {
  LOGIN,
  TYPES,
  PRODUCTS,
  CATEGORY,
  DASHBOARD,
  ORDERS,
  SETTINGS,
  CUSTOMERS,
  COUPONS,
  STAFF_MEMBERS,
  SITE_SETTINGS, PAYMENT_OPTIONS, DELIVERY_METHODS, HOMECARDS,
} from './settings/constants';
import AuthProvider, { AuthContext } from './context/auth';
import { InLineLoader } from './components/InlineLoader/InlineLoader';
import {gql} from "apollo-boost";
import {useQuery} from "@apollo/react-hooks";
const Types = lazy(() => import('./containers/Types/Types'));
const Products = lazy(() => import('./containers/Products/Products'));
const AdminLayout = lazy(() => import('./containers/Layout/Layout'));
const Dashboard = lazy(() => import('./containers/Dashboard/Dashboard'));
const Category = lazy(() => import('./containers/Category/Category'));
const PaymentOptions = lazy(() => import('./containers/PaymentOptions/PaymentOptions'));
const DeliveryMethods = lazy(() => import('./containers/DeliveryMethods/DeliveryMethods'));
const HomeCards = lazy(() => import('./containers/HomeCards/HomeCards'));
const Orders = lazy(() => import('./containers/Orders/Orders'));
const Settings = lazy(() => import('./containers/Settings/Settings'));
const SiteSettingForm = lazy(() =>
  import('./containers/SiteSettingForm/SiteSettingForm')
);
const StaffMembers = lazy(() =>
  import('./containers/StaffMembers/StaffMembers')
);
const Customers = lazy(() => import('./containers/Customers/Customers'));
const Coupons = lazy(() => import('./containers/Coupons/Coupons'));
const Login = lazy(() => import('./containers/Login/Login'));
const NotFound = lazy(() => import('./containers/NotFound/NotFound'));

/**
 *
 *  A wrapper for <Route> that redirects to the login
 * screen if you're not yet authenticated.
 *
 */
const AUTH_CHECK = gql`
  query AuthCheck {
    userAuthCheck {
      status
      message
    }
  }
`;

const authCheck = (cp) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    return cp(token);
  }
  return false;
}


function PrivateRoute({ children, ...rest }) {
  const {data, error: authError, refetch: authRefactch} = useQuery(AUTH_CHECK)
  const { isAuthenticated, signout } = useContext(AuthContext);


  authCheck(function (token) {
      if (token) {
        authRefactch().then(res => {
          if (res.data && !res.data.userAuthCheck.status) {
            signout();
          }
        });
      }
  })


  return (
    <Route
      {...rest}
      render={({ location }) =>
      {
        return isAuthenticated ? (
            children
        ) : (
            <Redirect
                to={{
                  pathname: '/login',
                  state: { from: location },
                }}
            />
        )
      }
      }
    />
  );
}

const Routes = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<InLineLoader />}>
        <Switch>
          <PrivateRoute exact={true} path={DASHBOARD}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Dashboard />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={TYPES}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Types />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={PRODUCTS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Products />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={CATEGORY}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Category />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={PAYMENT_OPTIONS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <PaymentOptions />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={DELIVERY_METHODS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <DeliveryMethods />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={ORDERS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Orders />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={CUSTOMERS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Customers />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={COUPONS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Coupons />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={HOMECARDS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <HomeCards />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={SETTINGS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <Settings />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={STAFF_MEMBERS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <StaffMembers />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>
          <PrivateRoute path={SITE_SETTINGS}>
            <AdminLayout>
              <Suspense fallback={<InLineLoader />}>
                <SiteSettingForm />
              </Suspense>
            </AdminLayout>
          </PrivateRoute>

          <Route path={LOGIN}>
            <Login />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AuthProvider>
  );
};

export default Routes;
