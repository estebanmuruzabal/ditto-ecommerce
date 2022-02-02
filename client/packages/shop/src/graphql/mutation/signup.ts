import gql from 'graphql-tag';

export const SIGNUP_MUTATION = gql`
mutation SignUp($phone: String!, $password: String!) {
  signUp(phone: $phone, password: $password) {
    status
    message
  }
}
`;

export const PHONE_VERIFICATION_MUTATION = gql`
mutation phoneVerification($phone: String!) {
    phoneVerification(phone: $phone) {
    status
    message
  }
}
`;


export const PHONE_VERIFICATION_CHECK_MUTATION = gql`
mutation phoneVerificationCheck($phone: String!, $verification_code: String!) {
    phoneVerificationCheck(phone: $phone, verification_code: $verification_code) {
        user {
            id
            phones{
                number
            }
        }
        access_token
  }
}
`;