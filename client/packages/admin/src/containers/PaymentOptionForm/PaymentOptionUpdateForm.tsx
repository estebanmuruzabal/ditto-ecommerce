import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation, useQuery} from '@apollo/react-hooks';
import { useDrawerDispatch, useDrawerState } from '../../context/DrawerContext';
import { Scrollbars } from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
import Button, { KIND } from '../../components/Button/Button';
import DrawerBox from '../../components/DrawerBox/DrawerBox';
import { Row, Col } from '../../components/FlexBox/FlexBox';
import {
  Form,
  DrawerTitleWrapper,
  DrawerTitle,
  FieldDetails,
  ButtonGroup,
} from '../DrawerItems/DrawerItems.style';
import { FormFields, FormLabel } from '../../components/FormFields/FormFields';
import {getBase64Value} from "../../helpers/convert-image-base64";
import {ADMIN_IMAGE_HOST} from "../../helpers/images-path";

const GET_PAYMENT_OPTIONS = gql`
  query GetPaymentOptions(
    $searchText: String
    $offset: Int
  ) {
    paymentOptions(
      searchText: $searchText
      offset: $offset
    ) {
      items {
        id
        name
        type
        image
        details
        created_at
      }
      totalCount
      hasMore
    }
  }
`;

const UPDATE_PAYMENT_OPTION = gql`
  mutation CreatePaymentOption($id: ID!, $name: String!, $type: String!, $image: String!, $image_data: String!, $details: String!) {
    updatePaymentOption(id: $id, name: $name, type: $type, image: $image, image_data: $image_data, details: $details) {
      id
      name
      type
      image
      details
      created_at
    }
  }
`;

type Props = any;

const UpdatePaymentOption: React.FC<Props> = props => {
  const dispatch = useDrawerDispatch();
  const itemData = useDrawerState('data');

  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: itemData,
  })

  React.useEffect(() => {
    register({ name: 'image_data' });
    register({ name: 'image', required: true });
  }, [register]);

  const { data, error, refetch } = useQuery(GET_PAYMENT_OPTIONS);

  const [updatePaymentOption] = useMutation(UPDATE_PAYMENT_OPTION);

  const onSubmit = ({ name, type, details, image, image_data}) => {

    updatePaymentOption({
      variables: {
        id: itemData.id,
        name: name,
        type: type,
        details: details,
        image_data: image_data,
        image: image,
      },
    });
    closeDrawer();
  };
  const handleUploader = files => {
    setValue('image_data', JSON.stringify({name: files[0].name, size: files[0].size, type: files[0].type}));

    getBase64Value(files[0], imageBase64Value => {
      setValue('image', imageBase64Value);
    })
  };


  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Update Payment Option</DrawerTitle>
      </DrawerTitleWrapper>

      <Form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }} encType={'multipart/form-data'}>
        <Scrollbars
          autoHide
          renderView={props => (
            <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />
          )}
          renderTrackHorizontal={props => (
            <div
              {...props}
              style={{ display: 'none' }}
              className="track-horizontal"
            />
          )}
        >
          <Row>
            <Col lg={4}>
              <FieldDetails>Upload your payment option image here</FieldDetails>
            </Col>
            <Col lg={8}>
              <DrawerBox
                overrides={{
                  Block: {
                    style: {
                      width: '100%',
                      height: 'auto',
                      padding: '30px',
                      borderRadius: '3px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  },
                }}
              >
                <Uploader type={'file'} required={true} onChange={handleUploader} imageURL={ADMIN_IMAGE_HOST+itemData.image} />
              </DrawerBox>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <FieldDetails>
                Update your payment option and necessary information's from here
              </FieldDetails>
            </Col>

            <Col lg={8}>
              <DrawerBox>
                <FormFields>
                  <FormLabel>Name</FormLabel>
                  <Input
                    inputRef={register({ required: true })}
                    name="name"
                    required={true}
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Type</FormLabel>
                  <Input
                      inputRef={register({required: true})}
                      name="type"
                      required={true}
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Details</FormLabel>
                  <Input
                      inputRef={register({required: true})}
                      name="details"
                      required={true}
                  />
                </FormFields>
              </DrawerBox>
            </Col>
          </Row>
        </Scrollbars>

        <ButtonGroup>
          <Button
            kind={KIND.minimal}
            onClick={closeDrawer}
            overrides={{
              BaseButton: {
                style: ({ $theme }) => ({
                  width: '50%',
                  borderTopLeftRadius: '3px',
                  borderTopRightRadius: '3px',
                  borderBottomRightRadius: '3px',
                  borderBottomLeftRadius: '3px',
                  marginRight: '15px',
                  color: $theme.colors.red400,
                }),
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            overrides={{
              BaseButton: {
                style: ({ $theme }) => ({
                  width: '50%',
                  borderTopLeftRadius: '3px',
                  borderTopRightRadius: '3px',
                  borderBottomRightRadius: '3px',
                  borderBottomLeftRadius: '3px',
                }),
              },
            }}
          >
            Update Payment Option
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default UpdatePaymentOption;
