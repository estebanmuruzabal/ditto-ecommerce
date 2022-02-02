import React, { useContext } from 'react';
import SignInForm from './login';
import SignOutForm from './register';
import ForgotPassForm from './forgot-password';
import OtpModal from './otpForm';
import PhoneVerificationModal from './phone-verification';
import { AuthContext } from 'contexts/auth/auth.context';

export default function AuthenticationForm() {
  const { authState } = useContext<any>(AuthContext);
  let RenderForm;

  if (authState.currentForm === 'signIn') {
    RenderForm = SignInForm;
  }

  if (authState.currentForm === 'signUp') {
    RenderForm = SignOutForm;
  }

  if (authState.currentForm === 'forgotPass') {
    RenderForm = ForgotPassForm;
  }

  if (authState.currentForm === 'otpVerification') {
    RenderForm = OtpModal;
  }

  if (authState.currentForm === 'phoneVerification') {
    RenderForm = PhoneVerificationModal;
  }

  return <RenderForm />;
}
