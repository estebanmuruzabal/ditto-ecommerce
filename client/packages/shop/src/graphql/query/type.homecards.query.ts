import gql from 'graphql-tag';

export const GET_TYPE_HOMECARDS = gql`
  query GetHomeCards($type: String!) {
      getHomeCards(type: $type) {
          id
          name
          url
          image
      }
  }
`;
