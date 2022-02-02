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

const GET_HOMECARDS = gql`
    query GetHomeCards(
        $searchText: String
        $offset: Int
    ) {
        homeCards(
            searchText: $searchText
            offset: $offset
        ) {
            items {
                id
                name
                url
                image
                status
                types {
                    id
                    slug
                    name
                }
                created_at
            }
            totalCount
            hasMore
        }
    }
`;

const DELETE_HOMECARD = gql`
    mutation DeleteHomeCard($id: ID!) {
        deleteHomeCard(id: $id) {
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
                    drawerComponent: 'HOMECARD_UPDATE_FORM',
                    data: itemData,
                })
            },
            [dispatch, itemData]
        );
        
        const updateItemsQuery = (cache) => {
            const {homeCards} = cache.readQuery({
                query: GET_HOMECARDS,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
            });

            cache.writeQuery({
                query: GET_HOMECARDS,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
                data: {
                    homeCards: {
                        __typename: homeCards.__typename,
                        items: homeCards.items.filter((item) => {
                            return item.id !== itemData.id;
                        }),
                        hasMore: homeCards.items.length - 1 >= 12,
                        totalCount: homeCards.items.length - 1,
                    },
                },
            });
        };

        const [deleteHomeCard] = useMutation(DELETE_HOMECARD, {
            update: updateItemsQuery
        });
        const itemDelete = () => {
            // eslint-disable-next-line no-restricted-globals
            if (confirm('Are you sure? You can not undo this.')) {
                deleteHomeCard({
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
