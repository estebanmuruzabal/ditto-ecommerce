import React, { useContext, useState } from 'react';
import * as Yup from 'yup';
import { withFormik, FormikProps, Form } from 'formik';
import { closeModal } from '@redq/reuse-modal';
import TextField from 'components/forms/text-field';
import { Button } from 'components/button/button';
import { useMutation } from '@apollo/react-hooks';
import { UPDATE_ADDRESS } from 'graphql/mutation/address';
import { FieldWrapper, Heading } from './address-card.style';
import { ProfileContext } from 'contexts/profile/profile.context';
import { FormattedMessage, useIntl } from 'react-intl';
import Loader from 'components/loader/loader';

// Shape of form values
interface FormValues {
  id?: number | null;
  name?: string;
  info?: string;
}

// The type of props MyForm receives
interface MyFormProps {
  item?: any | null;
}

// Wrap our form with the using withFormik HoC
const FormEnhancer = withFormik<MyFormProps, FormValues>({
  // Transform outer props into form values
  mapPropsToValues: (props) => {
    return {
      id: props.item.id || null,
      name: props.item.name || '',
      info: props.item.info || '',
    };
  },
  validationSchema: Yup.object().shape({
    name: Yup.string().required('Title is required!'),
    info: Yup.string().required('Address is required'),
  }),
  handleSubmit: (values) => {
    // do submitting things
  },
});

const UpdateAddress = (props: FormikProps<FormValues> & MyFormProps) => {
  const {
    isValid,
    item,
    values,
    touched,
    errors,
    dirty,
    handleChange,
    handleBlur,

    handleReset,
    isSubmitting,
  } = props;
  const addressValue = {
    id: values.id,
    type: 'secondary',
    name: values.name,
    info: values.info,
  };
  const { state, dispatch } = useContext(ProfileContext);
  const [loading, setLoading] = useState(false);
  const [addressMutation, { data }] = useMutation(UPDATE_ADDRESS);
  const intl = useIntl();

  const handleSubmit = async () => {
    if (isValid) {
      const addressData = await addressMutation({
        variables: { addressInput: JSON.stringify(addressValue) },
      });
      
      setLoading(true);
      dispatch({ type: 'ADD_OR_UPDATE_ADDRESS', payload: addressValue });
      closeModal();
      setLoading(false);
    }
  };

  return (
    <Form>
      <Heading>{<Heading>{intl.formatMessage({ id: item?.id ? 'editAddressId' : 'addNewAddressId', defaultMessage: 'Address name' })}</Heading>}</Heading>
      <FieldWrapper>
        <TextField
          id="name"
          type="text"
          placeholder={intl.formatMessage({ id: 'addressRefId', defaultMessage: 'Address name' })}
          error={touched.name && errors.name}
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FieldWrapper>

      <FieldWrapper>
        <TextField
          id="info"
          as="textarea"
          placeholder="Enter Address"
          error={touched.info && errors.info}
          value={values.info}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FieldWrapper>

      <Button
        onClick={handleSubmit}
        type="submit"
        style={{ width: '100%', height: '44px' }}
        loader={<Loader />}
        isDisabled={loading}
        isLoading={loading}
      >
        <FormattedMessage id="savedAddressId" defaultMessage="Save Address" />
      </Button>
    </Form>
  );
};

export default FormEnhancer(UpdateAddress);
