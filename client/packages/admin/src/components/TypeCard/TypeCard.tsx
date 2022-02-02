import React from 'react';
import {
  TypeCardWrapper,
  TypeName,
  TypeSlug,
  TypeInfo,
} from './TypeCard.style';
import { useDrawerDispatch } from '../../context/DrawerContext';

type TypeCardProps = {
  name: string;
  slug: string;
  data: any;
};

const TypeCard: React.FC<TypeCardProps> = ({
  name,
  slug,
  data,
  ...props
}) => {
  const dispatch = useDrawerDispatch();

  const openDrawer = React.useCallback(
    () =>
      dispatch({
        type: 'OPEN_DRAWER',
        drawerComponent: 'PRODUCT_UPDATE_FORM',
        data: data,
      }),
    [dispatch, data]
  );
  return (
    <TypeCardWrapper
      {...props}
      className="product-card"
      onClick={openDrawer}
    >
      <TypeInfo>
        <TypeName>{name}</TypeName>
        <TypeSlug>{slug}</TypeSlug>
      </TypeInfo>
    </TypeCardWrapper>
  );
};

export default TypeCard;
