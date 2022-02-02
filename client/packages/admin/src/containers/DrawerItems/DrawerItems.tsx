import React, { useCallback } from 'react';
import { styled } from 'baseui';
import Drawer from '../../components/Drawer/Drawer';
import { CloseIcon } from '../../assets/icons/CloseIcon';
import { useDrawerState, useDrawerDispatch } from '../../context/DrawerContext';

/** Drawer Components */
import TypeForm from '../TypeForm/TypeForm';
import TypeUpdateForm from '../TypeForm/TypeUpdateForm';
import ProductForm from '../ProductForm/ProductForm';
import ProductUpdateForm from '../ProductForm/ProductUpdateForm';
import CampaingForm from '../CampaingForm/CampaingForm';
import CategoryForm from '../CategoryForm/CategoryForm';
import CategoryUpdateForm from '../CategoryForm/CategoryUpdateForm';
import PaymentOptionForm from '../PaymentOptionForm/PaymentOptionForm';
import PaymentOptionUpdateForm from '../PaymentOptionForm/PaymentOptionUpdateForm';
import DeliveryMethodForm from '../DeliveryMethodForm/DeliveryMethodForm';
import DeliveryMethodUpdateForm from '../DeliveryMethodForm/DeliveryMethodUpdateForm';
import OrderStatusUpdateForm from '../Orders/OrderStatusUpdateForm';
import StaffMemberForm from '../StaffMemberForm/StaffMemberForm';
import Sidebar from '../Layout/Sidebar/Sidebar';
import CouponForm from '../CouponForm/CouponForm';
import CouponUpdateForm from '../CouponForm/CouponUpdateForm';
import HomeCardForm from '../HomeCardForm/HomeCardForm';
import HomeCardUpdateForm from '../HomeCardForm/HomeCardUpdateForm';

/** Components Name Constants */
const DRAWER_COMPONENTS = {
  TYPE_FORM: TypeForm,
  TYPE_UPDATE_FORM: TypeUpdateForm,
  PRODUCT_FORM: ProductForm,
  PRODUCT_UPDATE_FORM: ProductUpdateForm,
  CAMPAING_FORM: CampaingForm,
  CATEGORY_FORM: CategoryForm,
  CATEGORY_UPDATE_FORM: CategoryUpdateForm,
  PAYMENT_OPTION_FORM: PaymentOptionForm,
  PAYMENT_OPTION_UPDATE_FORM: PaymentOptionUpdateForm,
  DELIVERY_METHOD_FORM: DeliveryMethodForm,
  DELIVERY_METHOD_UPDATE_FORM: DeliveryMethodUpdateForm,
  ORDER_STATUS_UPDATE_FORM: OrderStatusUpdateForm,
  STAFF_MEMBER_FORM: StaffMemberForm,
  COUPON_FORM: CouponForm,
  COUPON_UPDATE_FORM: CouponUpdateForm,
  HOMECARD_FORM: HomeCardForm,
  HOMECARD_UPDATE_FORM: HomeCardUpdateForm,
  SIDEBAR: Sidebar,
};

const CloseButton = styled('button', ({ $theme }) => ({
  ...$theme.typography.fontBold14,
  color: $theme.colors.textNormal,
  lineHeight: 1.2,
  outline: '0',
  border: 'none',
  padding: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '10px',
  left: '-30px',
  right: 'auto',
  cursor: 'pointer',
  backgroundColor: '#ffffff',
  width: '20px',
  height: '20px',
  borderRadius: '50%',

  '@media only screen and (max-width: 767px)': {
    left: 'auto',
    right: '30px',
    top: '29px',
  },
}));

export default function DrawerItems() {
  const isOpen = useDrawerState('isOpen');
  const drawerComponent = useDrawerState('drawerComponent');
  const data = useDrawerState('data');
  const dispatch = useDrawerDispatch();
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  if (!drawerComponent) {
    return null;
  }
  const SpecificContent = DRAWER_COMPONENTS[drawerComponent];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      overrides={{
        Root: {
          style: {
            zIndex:
              DRAWER_COMPONENTS[drawerComponent] ===
              DRAWER_COMPONENTS.STAFF_MEMBER_FORM
                ? 0
                : 2,
          },
        },
        DrawerBody: {
          style: {
            marginTop: '80px',
            marginLeft: '60px',
            marginRight: '60px',
            marginBottom: '30px',
            '@media only screen and (max-width: 767px)': {
              marginTop: '80px',
              marginLeft: '30px',
              marginRight: '30px',
              marginBottom: '30px',
            },
          },
        },
        DrawerContainer: {
          style: {
            width: '70vw',
            backgroundColor: '#f7f7f7',
            '@media only screen and (max-width: 767px)': {
              width: '100%',
            },
          },
        },
        Close: {
          component: () => (
            <CloseButton onClick={closeDrawer}>
              <CloseIcon width='6px' height='6px' />
            </CloseButton>
          ),
        },
      }}
    >
      <SpecificContent onClose={closeDrawer} data={data} />
    </Drawer>
  );
}
