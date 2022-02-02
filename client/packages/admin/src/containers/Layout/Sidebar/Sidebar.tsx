import React, { useContext } from 'react';
import { withRouter } from 'react-router-dom';
import {
  SidebarWrapper,
  NavLink,
  MenuWrapper,
  Svg,
  LogoutBtn,
} from './Sidebar.style';
import {
  DASHBOARD,
  TYPES,
  PRODUCTS,
  CATEGORY,
  ORDERS,
  CUSTOMERS,
  COUPONS,
  HOMECARDS,
  SETTINGS,
  PAYMENT_OPTIONS, DELIVERY_METHODS,
} from '../../../settings/constants';
import { AuthContext } from '../../../context/auth';
import {
  DashboardIcon,
  ProductIcon,
  SidebarCategoryIcon,
  OrderIcon,
  CustomerIcon,
  CouponIcon,
  SettingIcon,
  LogoutIcon,
    MenuIcon,
    Accessories,
    CarretUpIcon,
    InboxIcon
} from '../../../components/AllSvgIcon';

const sidebarMenus = [
  {
    name: 'Dashboard',
    path: DASHBOARD,
    exact: true,
    icon: <DashboardIcon />,
  },
  {
    name: 'Types',
    path: TYPES,
    exact: false,
    icon: <MenuIcon />,
  },
  {
    name: 'Categories',
    path: CATEGORY,
    exact: false,
    icon: <SidebarCategoryIcon />,
  },
  {
    name: 'Products',
    path: PRODUCTS,
    exact: false,
    icon: <ProductIcon />,
  },
  {
    name: 'PaymentOptions',
    path: PAYMENT_OPTIONS,
    exact: false,
    icon: <Accessories />,
  },
  {
    name: 'DeliveryMethods',
    path: DELIVERY_METHODS,
    exact: false,
    icon: <CarretUpIcon />,
  },
 {
    name: 'Orders',
    path: ORDERS,
    exact: false,
    icon: <OrderIcon />,
  },
  /*   {
      name: 'Customers',
      path: CUSTOMERS,
      exact: false,
      icon: <CustomerIcon />,
    },*/
  {
    name: 'Coupons',
    path: COUPONS,
    exact: false,
    icon: <CouponIcon />,
  },
  {
    name: 'HomeCards',
    path: HOMECARDS,
    exact: false,
    icon: <InboxIcon />,
  },
  {
    name: 'Settings',
    path: SETTINGS,
    exact: false,
    icon: <SettingIcon />,
  },
];

export default withRouter(function Sidebar({
  refs,
  style,
  onMenuItemClick,
}: any) {
  const { signout } = useContext(AuthContext);
  return (
    <SidebarWrapper ref={refs} style={style}>
      <MenuWrapper>
        {sidebarMenus.map((menu: any, index: number) => (
          <NavLink
            to={menu.path}
            key={index}
            exact={menu.exact}
            activeStyle={{
              color: '#00C58D',
              backgroundColor: '#f7f7f7',
              borderRadius: '50px 0 0 50px',
            }}
            onClick={onMenuItemClick}
          >
            {menu.icon ? <Svg>{menu.icon}</Svg> : ''}
            {menu.name}
          </NavLink>
        ))}
      </MenuWrapper>

      <LogoutBtn
        onClick={() => {
          signout();
        }}
      >
        <Svg>
          <LogoutIcon />
        </Svg>
        Logout
      </LogoutBtn>
    </SidebarWrapper>
  );
});
