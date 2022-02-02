import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useDrawerDispatch } from '../../context/DrawerContext';
import { Scrollbars } from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button, { KIND } from '../../components/Button/Button';
import DrawerBox from '../../components/DrawerBox/DrawerBox';
import { Row, Col } from '../../components/FlexBox/FlexBox';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Form,
  DrawerTitleWrapper,
  DrawerTitle,
  FieldDetails,
  ButtonGroup,
} from '../DrawerItems/DrawerItems.style';
import { FormFields, FormLabel } from '../../components/FormFields/FormFields';
import { getBase64Value } from '../../helpers/convert-image-base64';
import { displayErrorMessage, displaySuccessNotification } from '../../helpers/custom-message';
import { AllIconArray } from '../../assets/icons/all-icons';
import { TYPE } from 'baseui/select';
import { Textarea } from '../../components/Textarea/Textarea';
import { CREATED, EXPIRED, RUNNING } from '../../settings/constants';

const GET_COUPONS = gql`
  query GetCoupons( $searchText: String, $offset: Int) {
    coupons(searchText: $searchText, offset: $offset) {
      items{
        id
        title
        code
        percentage
        maximum_discount_amount
        expiration_date
        status
        created_at
      } 
      totalCount
      hasMore
    }
  }
`;

const CREATE_COUPON = gql`
  mutation CreateCoupon($coupon: CouponInput!) {
    createCoupon(input: $coupon)  {
        id
        title
        code
        percentage
        maximum_discount_amount
        expiration_date
        status
        created_at
    }
  }
`;

type Props = any;

const AddCoupon: React.FC<Props> = props => {
  const dispatch = useDrawerDispatch();
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  const { register, handleSubmit, setValue } = useForm();
  const [dateExpired, setDateExpired] = useState('');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [percentage, setPercentage] = useState('');
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState('');
  const [status, setStatus] = useState([]);

  const statusOptions = [
    { label: 'Running', value: RUNNING },
    { label: 'Expired', value: EXPIRED },
  ];

  const [createCoupon] = useMutation(CREATE_COUPON, {

    onCompleted: () => {
      displaySuccessNotification("You've successfully created your Coupon!");
    },
    onError: (e) => {

      displayErrorMessage(
        "Sorry! We weren't able to create your Coupon. Please try again later."
      );
    },
    update(cache, { data: { createCoupon } }) {
      const { coupons } = cache.readQuery({
        query: GET_COUPONS,
      });

      cache.writeQuery({
        query: GET_COUPONS,
        data: {
          coupons: {
            __typename: coupons.__typename,
            items: [createCoupon, ...coupons.items],
            hasMore: coupons.items.length + 1 >= 12,
            totalCount: coupons.items.length + 1,
          },
        },
      });
    }
  });


  const onSubmit = () => {

    const newCoupon = {
      title: title,
      code: code,
      percentage: parseFloat(percentage),
      maximum_discount_amount: parseFloat(maximumDiscountAmount),
      expiration_date: dateExpired,
      status: status[0] && status[0].value
    };

    createCoupon({
      variables: { coupon: newCoupon },
    });
    closeDrawer();
  };

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Add Coupon</DrawerTitle>
      </DrawerTitleWrapper>

      <Form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
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
              <FieldDetails>
                Add your coupon description and necessary informations from
                here
              </FieldDetails>
            </Col>

            <Col lg={8}>
              <DrawerBox>
                <FormFields>
                  <FormLabel>Coupon Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    name="title"
                  />
                </FormFields>
                <FormFields>
                  <FormLabel>Coupon Code</FormLabel>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    name="code"
                  />
                </FormFields>
                <FormFields>
                  <FormLabel>Discount Percentage</FormLabel>
                  <Input
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                    name="percentage"
                  />
                </FormFields>
                <FormFields>
                  <FormLabel>Maximum Discount Amount</FormLabel>
                  <Input
                    value={maximumDiscountAmount}
                    onChange={(e) => setMaximumDiscountAmount(e.target.value)}
                    name="maximum_discount_amount"
                  />
                </FormFields>

                <div data-baseweb="block" className="ai ae bk gs gu gv">
                  <label className="bs dt bu bv gw b9">Expiration Date</label>
                  <div data-baseweb="input" className="bs bt cq cr cs ae ai">
                    <div data-baseweb="base-input" className="ct ae ai cu cv cw cx cy cz d0 d1 d2 d3 d4 d5 d6 d7 d8 bs bt cq cr cs d9 da db dc dd">
                      <DatePicker
                      className="ct c5 de df dg dh di dj dk dl dm ai dn do cp dp dq dr ds bs dt bu bv b9 du dv"
                      selected={dateExpired}
                      onChange={(date) => setDateExpired(date)}
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      showTimeInput
                    />
                    </div>
                  </div>
                </div>

                <FormFields>
                  <FormLabel>Status</FormLabel>
                  <Select
                    options={statusOptions}
                    labelKey="label"
                    valueKey="value"
                    placeholder="Select Status"
                    value={status}
                    required={true}
                    searchable={true}
                    onChange={(e) => setStatus(e.value)}
                    overrides={{
                      Popover: {
                        props: {
                          overrides: {
                            Body: {
                              style: { zIndex: 5 },
                            },
                          },
                        },
                      },
                    }}
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
            Create Coupon
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default AddCoupon;
