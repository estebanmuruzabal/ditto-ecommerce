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

const DELETE_PAYMENT_OPTION = gql`
    mutation DeletePaymentOption($id: ID!) {
        deletePaymentOption(id: $id) {
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
                    drawerComponent: 'PAYMENT_OPTION_UPDATE_FORM',
                    data: itemData,
                })
            },
            [dispatch, itemData]
        );
        
        const updateItemsQuery = (cache) => {
            const {paymentOptions} = cache.readQuery({
                query: GET_PAYMENT_OPTIONS,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
            });

            cache.writeQuery({
                query: GET_PAYMENT_OPTIONS,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
                data: {
                    paymentOptions: {
                        __typename: paymentOptions.__typename,
                        items: paymentOptions.items.filter((item) => {
                            return item.id !== itemData.id;
                        }),
                        hasMore: paymentOptions.items.length - 1 >= 12,
                        totalCount: paymentOptions.items.length - 1,
                    },
                },
            });
        };

        const [deletePaymentOption] = useMutation(DELETE_PAYMENT_OPTION, {
            update: updateItemsQuery
        });
        const itemDelete = () => {
            // eslint-disable-next-line no-restricted-globals
            if (confirm('Are you sure? You can not undo this.')) {
                deletePaymentOption({
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
