import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/react-hooks';

import { Input } from 'components/forms/input';
import {
  Button,
  Wrapper,
  Container,
  Heading,
  SubHeading,
  HelperText,
  Offer,
  LinkButton,
} from './authentication-form.style';
import { AuthContext } from 'contexts/auth/auth.context';
import { FormattedMessage, useIntl } from 'react-intl';
import { SIGNUP_MUTATION } from 'graphql/mutation/signup';
import PhoneInput from 'react-phone-input-2'
import startsWith from 'lodash.startswith';

export default function SignOutModal() {
  const intl = useIntl();
  const { authState, authDispatch } = useContext<any>(AuthContext);
  const toggleSignInForm = () => {
    authDispatch({
      type: 'SIGNIN',
    });
  };

  const toggleOtpForm = () => {
    authDispatch({
      type: 'OTP_VERIFICATION',
    });
  };

  //signup
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [
    signupMeMutation,
    { 
      loading,
      error
    }
  ] = useMutation(SIGNUP_MUTATION,{
    onCompleted: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('phone_number', `${phone}`);
        toggleOtpForm();
      }
    },
    onError: (error) => {
      setPhone('');
      setPassword('');
      console.log(error);
    }
  });

  const handlePhoneChange = (value, data, event, formattedValue) => {
    setPhone(value)
  }


  return (
    <Wrapper>
      <Container>
        <Heading>
          <FormattedMessage id='signUpBtnText' defaultMessage='Sign Up' />
        </Heading>
        <SubHeading>
          <FormattedMessage
            id='signUpText'
            defaultMessage='Every fill is required in sign up'
          />
        </SubHeading>
          <form method="post" onSubmit={
            async (e) => {
                e.preventDefault();
                await signupMeMutation({
                  variables: {phone, password}
                });
              }
            }
          >
            <PhoneInput
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true
                }}
                containerStyle={{textAlign: "left"}}
                inputStyle={{backgroundColor: "#F7F7F7", height: "48px", marginBottom: "10px", width: "100%"}}
                country={'bd'}
                value={phone}
                onChange={handlePhoneChange}
            />
            <Input
              type='password'
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={intl.formatMessage({
                id: 'passwordPlaceholder',
                defaultMessage: 'Password (min 6 characters)',
              })}
              height='48px'
              backgroundColor='#F7F7F7'
              mb='10px'
              required
            />
            <HelperText style={{ padding: '20px 0 30px' }}>
              <FormattedMessage
                id='tramsText'
                defaultMessage="By signing up, you agree to Ditto's"
              />
              &nbsp;
              <Link href='/'>
                <a>
                  <FormattedMessage
                    id='termsConditionText'
                    defaultMessage='Terms &amp; Condition'
                  />
                </a>
              </Link>
            </HelperText>
            <Button variant='primary' size='big' width='100%' type='submit'>
              <FormattedMessage id='continueBtn' defaultMessage='Continue' />
            </Button>
          </form>
          {loading && <p style={{
            marginTop: "15px"
          }}>Loading...</p>}
          {error && <p style={{
            marginTop: "15px",
            color: "red"
          }}>Please try again</p>}
        <Offer style={{ padding: '20px 0' }}>
          <FormattedMessage
            id='alreadyHaveAccount'
            defaultMessage='Already have an account?'
          />{' '}
          <LinkButton onClick={toggleSignInForm}>
            <FormattedMessage id='loginBtnText' defaultMessage='Login' />
          </LinkButton>
        </Offer>
      </Container>
    </Wrapper>
  );
}
