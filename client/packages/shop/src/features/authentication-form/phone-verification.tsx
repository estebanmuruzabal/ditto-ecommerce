import React, { useContext } from 'react';
import {
  Wrapper,
  Container,
  Heading,
  SubHeading,
  Button,
  LinkButton,
  Offer,
} from './authentication-form.style';
import { FormattedMessage, useIntl } from 'react-intl';
import { AuthContext } from 'contexts/auth/auth.context';
import PhoneInput from 'react-phone-input-2'
import {useMutation} from "@apollo/react-hooks";
import {PHONE_VERIFICATION_MUTATION} from "../../graphql/mutation/signup";


export default function PhoneVerificationModal() {
  const { authDispatch } = useContext<any>(AuthContext);
  const [phone, setPhone] = React.useState('');

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

  const [
    phoneVerificationMutation,
    {
      loading,
      error
    }
  ] = useMutation(PHONE_VERIFICATION_MUTATION,{
    onCompleted: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('phone_number', `${phone}`);
        toggleOtpForm();
      }
    },
    onError: (error) => {
      setPhone('');
      console.log(error);
    }
  });

  const handlePhoneChange = (value, data, event, formattedValue) => {
    setPhone(value)
  }

  return (
    <Wrapper>
      <Container style={{ paddingBottom: 30 }}>
        <Heading>
          <FormattedMessage
            id='phoneVerificationText'
            defaultMessage='Phone Verification'
          />
        </Heading>

        <SubHeading>
          <FormattedMessage
            id='sendPhoneVerifyText'
            defaultMessage="We'll send you a verification code to verify your phone number"
          />
        </SubHeading>
        <form method="post" onSubmit={
          async (e) => {
            e.preventDefault();
            await phoneVerificationMutation({
              variables: {phone}
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

        <Button
          variant='primary'
          size='big'
          style={{ width: '100%' }}
          type='submit'
        >Send Code</Button>
        </form>
        {loading && <p style={{
          marginTop: "15px"
        }}>Loading...</p>}
        {error && <p style={{
          marginTop: "15px",
          color: "red"
        }}>Please try again!</p>}

        <Offer style={{ padding: '20px 0' }}>
          <FormattedMessage id='backToSign' defaultMessage='Back to' />{' '}
          <LinkButton onClick={toggleSignInForm}>
            <FormattedMessage id='loginBtnText' defaultMessage='Login' />
          </LinkButton>
        </Offer>
      </Container>
    </Wrapper>
  );
}
