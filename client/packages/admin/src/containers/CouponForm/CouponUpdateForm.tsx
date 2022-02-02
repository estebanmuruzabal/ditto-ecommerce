import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation, useQuery} from '@apollo/react-hooks';
import { useDrawerDispatch, useDrawerState } from '../../context/DrawerContext';
import { Scrollbars } from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
import {Textarea} from '../../components/Textarea/Textarea';
import { Select, TYPE } from 'baseui/select';
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
import {AllIconArray} from "../../assets/icons/all-icons";
import {getBase64Value} from "../../helpers/convert-image-base64";
import {ADMIN_IMAGE_HOST} from "../../helpers/images-path";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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


const UPDATE_COUPONS = gql`  
  mutation UpdateCoupon($id: ID!, $input: CouponInput!) {
    updateCoupon(id: $id, input: $input) {
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

const UpdateCoupon: React.FC<Props> = props => {
  const dispatch = useDrawerDispatch();
  const itemData = useDrawerState('data');
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [ dispatch]);
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: itemData,
  });

  const [dateExpired, setDateExpired] = useState(itemData.expiration_date ? new Date(itemData.expiration_date) : '');
  const [title, setTitle] = useState(itemData.title ? itemData.title : '');
  const [code, setCode] = useState(itemData.code ? itemData.code : '');
  const [percentage, setPercentage] = useState(itemData.percentage ? itemData.percentage : '');
  const [maximumDiscountAmount, setMaximumDiscountAmount] = useState(itemData.maximum_discount_amount ? itemData.maximum_discount_amount : '');
  
  const statusOptions = [
    { label: 'Running', value: RUNNING },
    { label: 'Expired', value: EXPIRED },
  ];
  
  const [status, setStatus] = useState(statusOptions.filter( status => status.value == itemData.status));
  const { data, error, refetch } = useQuery(GET_COUPONS);
  const [updateCoupons] = useMutation(UPDATE_COUPONS);


  const onSubmit = (data) => {
    const typeValue = {
      title: title,
      code: code,
      percentage: parseFloat(percentage),
      maximum_discount_amount: parseFloat(maximumDiscountAmount),
      expiration_date: dateExpired,
      status: status[0] && status[0].value
    };

    updateCoupons({
      variables: { id: itemData.id, input: typeValue },
    });
    closeDrawer();
  };

  function handleStatus({ value }) {
    setStatus(value);
  }

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Update Coupon</DrawerTitle>
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
              <FieldDetails>
                Update your Coupon and necessary information's from here
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
                    onChange={handleStatus}
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
            Update Type
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default UpdateCoupon;
