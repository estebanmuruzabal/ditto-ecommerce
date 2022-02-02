import React, {useContext, useState} from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/auth';
import {
  FormFields,
  FormLabel,
  FormTitle,
  Error,
} from '../../components/FormFields/FormFields';
import { Wrapper, FormWrapper, LogoImage, LogoWrapper } from './Login.style';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Logoimage from '../../assets/image/PickBazar.png';
import {gql} from "apollo-boost";
import {useQuery} from "@apollo/react-hooks";
import {ADMIN_IMAGE_HOST} from "../../helpers/images-path";

const initialValues = {
    phone: '',
  password: '',
};
const GET_SETTING = gql`
    query GetSetting {
        getSiteSetting(key: "site-settings") {
            id
            key
            value
        }
    }
`;
function getFaviconEl() {
    return document.getElementById("favicon") as HTMLAnchorElement;
}

const getLoginValidationSchema = () => {
  return Yup.object().shape({
      phone: Yup.string().required('Phone Number is Required!'),
    password: Yup.string().required('Password is Required!'),
  });
};

const MyInput = ({ field, form, ...props }) => {
  return <Input {...field} {...props} />;
};

export default () => {

    const {data, error, refetch} = useQuery(GET_SETTING)
    const [siteSettingData, setSiteSettingData] = useState<any | null>(null);

    React.useEffect(() => {
        if (data) {
            setSiteSettingData(JSON.parse(data.getSiteSetting.value))
        }
    }, [data])

    let fav = getFaviconEl();
    if (siteSettingData) {
        fav.href = ADMIN_IMAGE_HOST+siteSettingData.favicon;
    }

  let history = useHistory();
  let location = useLocation();
  const { authenticate, isAuthenticated } = useContext(AuthContext);
  if (isAuthenticated) return <Redirect to={{ pathname: '/' }} />;

  let { from } = (location.state as any) || { from: { pathname: '/' } };
  let login = ({ phone, password }) => {
    authenticate({ phone, password }, () => {
      history.replace(from);
    });
  };
  return (
    <Wrapper>
      <FormWrapper>
        <Formik
          initialValues={initialValues}
          onSubmit={login}
          render={({ errors, status, touched, isSubmitting }) => (
            <Form>
              <FormFields>
                <LogoWrapper>
                  <LogoImage src={siteSettingData ? ADMIN_IMAGE_HOST+siteSettingData.image : ''} alt={siteSettingData ? siteSettingData.site_title : ''} />
                </LogoWrapper>
                <FormTitle>Log in to admin</FormTitle>
              </FormFields>

              <FormFields>
                <FormLabel>Email</FormLabel>
                <Field
                  type='text'
                  name='phone'
                  component={MyInput}
                  placeholder='Ex: demo@demo.com'
                />
                {errors.phone && touched.phone && (
                  <Error>{errors.phone}</Error>
                )}
              </FormFields>
              <FormFields>
                <FormLabel>Password</FormLabel>
                <Field
                  type='password'
                  name='password'
                  component={MyInput}
                  placeholder='Ex: demo'
                />
                {errors.password && touched.password && (
                  <Error>{errors.password}</Error>
                )}
              </FormFields>
              <Button
                type='submit'
                disabled={isSubmitting}
                overrides={{
                  BaseButton: {
                    style: ({ $theme }) => ({
                      width: '100%',
                      marginLeft: 'auto',
                      borderTopLeftRadius: '3px',
                      borderTopRightRadius: '3px',
                      borderBottomLeftRadius: '3px',
                      borderBottomRightRadius: '3px',
                    }),
                  },
                }}
              >
                Submit
              </Button>
            </Form>
          )}
          validationSchema={getLoginValidationSchema}
        />
      </FormWrapper>
    </Wrapper>
  );
};
