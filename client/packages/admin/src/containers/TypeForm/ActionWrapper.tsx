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

const GET_TYPES = gql`
    query GetTypes(
        $searchText: String
        $offset: Int
    ) {
        types(
            searchText: $searchText
            offset: $offset
        ) {
            items {
                id
                name
                slug
                image
                icon
                home_title
                home_subtitle
                meta_title
                meta_keyword
                meta_description
                created_at
            }
            totalCount
            hasMore
        }
    }
`;

const DELETE_TYPE = gql`
    mutation DeleteType($id: ID!) {
        deleteType(id: $id) {
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
                    drawerComponent: 'TYPE_UPDATE_FORM',
                    data: itemData,
                })
            },
            [dispatch, itemData]
        );
        
        const updateItemsQuery = (cache) => {
            const {types} = cache.readQuery({
                query: GET_TYPES,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
            });

            cache.writeQuery({
                query: GET_TYPES,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
                data: {
                    types: {
                        __typename: types.__typename,
                        items: types.items.filter((item) => {
                            return item.id !== itemData.id;
                        }),
                        hasMore: types.items.length - 1 >= 12,
                        totalCount: types.items.length - 1,
                    },
                },
            });
        };

        const [deleteType] = useMutation(DELETE_TYPE, {
            update: updateItemsQuery
        });
        const itemDelete = () => {
            // eslint-disable-next-line no-restricted-globals
            if (confirm('Are you sure? You can not undo this.')) {
                deleteType({
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
