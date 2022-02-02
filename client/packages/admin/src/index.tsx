import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider } from 'baseui';
import { ApolloProvider } from '@apollo/react-hooks';
import { theme } from './theme';
import Routes from './routes';
import {ApolloClient, ApolloLink, HttpLink, InMemoryCache} from 'apollo-boost';
import * as serviceWorker from './serviceWorker';
import './theme/global.css';

const httpLink = new HttpLink({ uri: process.env.REACT_APP_API_URL });

const authLink = new ApolloLink((operation, forward) => {
  // Retrieve the authorization token from local storage.
  const token = localStorage.getItem('admin_access_token');

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      'x-access-token': token ? token : ''
    }
  });

  // Call the next link in the middleware chain.
  return forward(operation);
});


const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

function App() {
  const engine = new Styletron();

  return (
    <ApolloProvider client={client as any}>
      <StyletronProvider value={engine}>
        <BaseProvider theme={theme}>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </BaseProvider>
      </StyletronProvider>
    </ApolloProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
