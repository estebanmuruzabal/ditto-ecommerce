import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation, useQuery} from '@apollo/react-hooks';
import { useDrawerDispatch, useDrawerState } from '../../context/DrawerContext';
import { Scrollbars } from 'react-custom-scrollbars';
import Button, { KIND } from '../../components/Button/Button';
import DrawerBox from '../../components/DrawerBox/DrawerBox';
import { Row, Col } from '../../components/FlexBox/FlexBox';
import {
  Form,
  DrawerTitleWrapper,
  DrawerTitle,
  ButtonGroup,
} from '../DrawerItems/DrawerItems.style';
import { RadioGroup, Radio, ALIGN } from "baseui/radio";


const GET_ORDERS = gql`
  query GetOrders(
    $status: String,
    $searchText: String
    $offset: Int
  ) {
    orders(
      status: $status,
      searchText: $searchText,
      offset: $offset,
    ) {
      items {
        id
        order_code
        customer_id
        contact_number
        datetime
        delivery_address
        payment_method
        payment_status
        status
        coupon_code
        discount_amount
        sub_total
        total
        delivery_method {
          name
          details
        }
        order_tracking {
          status
          ordering
          is_current
          step_competed
        }
      }
      totalCount
      hasMore
    }
  }
`;

  const UPDATE_ORDER_STATUS = gql`  
  mutation UpdateOrderStatus($id: ID!, $orderingPosition: Int!) {
    updateOrderStatus(id: $id, orderingPosition: $orderingPosition) {
      id
      order_code
      customer_id
      contact_number
      datetime
      delivery_address
      payment_method
      payment_status
      status
      coupon_code
      discount_amount
      sub_total
      total
      delivery_method {
        name
        details
      }
      order_tracking {
        status
        ordering
        is_current
        step_competed
      }
    }
  }
`;

type Props = any;

const UpdateOrderStatus: React.FC<Props> = props => {
  const dispatch = useDrawerDispatch();
  const itemData = useDrawerState('data');

  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);

  const [radioValue, setRadioValue] = useState('');

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: itemData,
  })


  React.useEffect(() => {}, [register]);

  useEffect(() => {
    const item = itemData.order_tracking.filter(item => {
          return item.is_current == true;
        }
    )[0].ordering;

    setRadioValue(""+item);
  },[]);


  const {data, error, refetch} = useQuery(GET_ORDERS);

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

  const onSubmit = () => {
    updateOrderStatus({
      variables: { id: itemData.id, orderingPosition: parseInt(radioValue) },
    });
    refetch();
    closeDrawer();
  };

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Update Order Status</DrawerTitle>
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
            <Col lg={2} />
            <Col lg={8} >
              <DrawerBox>
                <RadioGroup
                    value={radioValue}
                    onChange={e => setRadioValue(e.target.value)}
                    name="number"
                    align={ALIGN.vertical}
                >
                  <Radio value="1">Pending</Radio>
                  <Radio value="2">Received</Radio>
                  <Radio value="3">Processing</Radio>
                  <Radio value="4">InTransit</Radio>
                  <Radio value="5">Delivered</Radio>
                  <Radio value="6">Cancel</Radio>
                  <Radio value="7">Failed</Radio>
                </RadioGroup>
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
            Update Status
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default UpdateOrderStatus;
