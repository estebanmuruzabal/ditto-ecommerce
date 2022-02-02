import React from 'react';
import {useDrawerDispatch} from '../../context/DrawerContext';
import {
    IconWrapper,
    ActionStyle,
} from '../Types/Types.style';
import {AllIcons} from "../../assets/icons/all-icons";
import gql from 'graphql-tag';
import {useMutation} from "@apollo/react-hooks";


type Props = {
    itemData: any;
    itemsOffset: number;
};

const Icon = ({icon, width = '18px', height = '18px'}) => {
    let Component = AllIcons.hasOwnProperty(icon) ? AllIcons[icon] : 'span';
    return <Component width={width} height={height}/>;
}

const GET_COUPONS = gql`
query GetCoupons( $searchText: String, $offset: Int) {
    coupons(searchText: $searchText, offset: $offset) {
      items{
        id
        title
        code
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

const DELETE_COUPONS = gql`
    mutation DeleteCoupon($id: ID!) {
        deleteCoupon(id: $id) {
            message
            status
        }
    }
`;


const ActionWrapper: React.FC<Props> =
    ({
         itemData,
        itemsOffset,
         ...props
     }) => {
        const dispatch = useDrawerDispatch();
        const openDrawer = React.useCallback(
            () => {
                dispatch({
                    type: 'OPEN_DRAWER',
                    drawerComponent: 'COUPON_UPDATE_FORM',
                    data: itemData,
                })
            },
            [dispatch, itemData]
        );
        
        
        const updateItemsQuery = (cache) => {
            const {coupons} = cache.readQuery({
                query: GET_COUPONS,
            });

            cache.writeQuery({
                query: GET_COUPONS,
                data: {
                    coupons: {
                        __typename: coupons.__typename,
                        items: coupons.items.filter((item) => {
                            return item.id !== itemData.id;
                        }),
                        hasMore: coupons.items.length - 1 >= 12,
                        totalCount: coupons.items.length - 1,
                    },
                },
            });
        };

        const [deleteCoupons] = useMutation(DELETE_COUPONS, {
            update: updateItemsQuery
        });
        const itemDelete = () => {
            // eslint-disable-next-line no-restricted-globals
            if (confirm('Are you sure? You can not undo this.')) {
                deleteCoupons({
                    variables: {id: itemData.id},
                });
            }
        }

        return (
            <div>
                <ActionStyle>
                    <IconWrapper onClick={openDrawer} style={{marginRight: '10px', cursor: 'pointer'}}>
                        <Icon icon="ArrowNext"/>
                    </IconWrapper>
                </ActionStyle>
                <ActionStyle>
                    <IconWrapper onClick={itemDelete} style={{color: '#c50707', cursor: 'pointer'}}>
                        <Icon width="15px" height="15px" icon="CloseIcon"/>
                    </IconWrapper>
                </ActionStyle>
            </div>
        );
    };

export default ActionWrapper;
