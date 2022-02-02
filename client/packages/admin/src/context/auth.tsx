import React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';


const AUTH_LOGIN = gql`
  mutation LoginUser(
    $phone: String!
    $password: String!
  ) {
    login(
      phone: $phone
      password: $password
    ) {
      user {
        name
        phones {
          number
        }
      }
      access_token
    }
  }
`;



type AuthProps = {
  isAuthenticated: boolean;
  authenticate: Function;
  signout: Function;
};

export const AuthContext = React.createContext({} as AuthProps);

const isValidToken = () => {
  const token = localStorage.getItem('admin_access_token');
  // JWT decode & check token validity & expiration.
  if (token) return true;
  return false;
};

const AuthProvider = (props: any) => {
  const [loginUser] = useMutation(AUTH_LOGIN,
      {
        onCompleted: (data) => {
          makeAuthenticated(true);
          localStorage.setItem('admin_access_token', `${data.login.access_token}`);
        },
        onError: (error) => {
          makeAuthenticated(false);
          console.error("Error creating a post", error)
        },
      });

  const [isAuthenticated, makeAuthenticated] = React.useState(isValidToken());

  function authenticate({ phone, password }, cb) {
    let phoneNumber: string = phone.toString();
    let stringPassword: string = password.toString();
    loginUser({ variables: { phone: phoneNumber, password: stringPassword } });
    cb();
  }
  function signout(cb) {
    makeAuthenticated(false);
    localStorage.removeItem('admin_access_token');
  }
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authenticate,
        signout,
      }}
    >
      <>{props.children}</>
    </AuthContext.Provider>
  );
};

export default AuthProvider;
