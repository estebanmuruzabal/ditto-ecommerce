import React from 'react';
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

const GET_PRODUCTS = gql`
    query GetProducts(
        $type: String
        $category: String
        $searchText: String
        $offset: Int
    ) {
        products(
            type: $type
            category: $category
            searchText: $searchText
            offset: $offset
        ) {
            items {
                id
                type {
                    id
                    slug
                    name
                }
                categories {
                    id
                    slug
                    name
                }
                name
                slug
                description
                images
                unit
                price
                sale_price
                discount_in_percent
                product_quantity
                is_featured
                meta_title
                meta_keyword
                meta_description
            }
            totalCount
            hasMore
        }
    }
`;

const DELETE_PRODUCT = gql`
    mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id) {
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

        const updateItemsQuery = (cache) => {
            const {products} = cache.readQuery({
                query: GET_PRODUCTS,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
            });

            cache.writeQuery({
                query: GET_PRODUCTS,
                variables: itemsOffset !== 0 ? {offset: itemsOffset} : {},
                data: {
                    products: {
                        __typename: products.__typename,
                        items: products.items.filter((item) => {
                            return item.id !== itemData.id;
                        }),
                        hasMore: products.items.length - 1 >= 12,
                        totalCount: products.items.length - 1,
                    },
                },
            });
        };

        const [deleteProduct] = useMutation(DELETE_PRODUCT, {
            update: updateItemsQuery
        });
        const itemDelete = () => {
            // eslint-disable-next-line no-restricted-globals
            if (confirm('Are you sure? You can not undo this.')) {
                deleteProduct({
                    variables: {id: itemData.id},
                });
            }
        }

        return (
            <ActionStyle>
                <IconWrapper onClick={itemDelete} style={{color: '#c50707', cursor: 'pointer'}}>
                    <Icon width="15px" height="15px" icon="CloseIcon"/>
                </IconWrapper>
            </ActionStyle>
        );
    };

export default ActionWrapper;
