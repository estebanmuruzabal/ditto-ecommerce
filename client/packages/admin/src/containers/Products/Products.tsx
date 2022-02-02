import React, {useCallback, useState} from 'react';
import { styled, withStyle } from 'baseui';
import Button from '../../components/Button/Button';
import {
  Grid,
  Row as Rows,
  Col as Column,
} from '../../components/FlexBox/FlexBox';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Header, Heading } from '../../components/WrapperStyle';
import Fade from 'react-reveal/Fade';
import ProductCard from '../../components/ProductCard/ProductCard';
import NoResult from '../../components/NoResult/NoResult';
import { CURRENCY } from '../../settings/constants';
import Placeholder from '../../components/Placeholder/Placeholder';
import {ADMIN_IMAGE_HOST} from "../../helpers/images-path";
import {useDrawerDispatch} from "../../context/DrawerContext";
import {Plus} from "../../components/AllSvgIcon";

export const ProductsRow = styled('div', ({ $theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: '25px',
  backgroundColor: $theme.colors.backgroundF7,
  position: 'relative',
  zIndex: '1',

  '@media only screen and (max-width: 767px)': {
    marginLeft: '-7.5px',
    marginRight: '-7.5px',
    marginTop: '15px',
  },
}));

export const Col = withStyle(Column, () => ({
  '@media only screen and (max-width: 767px)': {
    marginBottom: '20px',

    ':last-child': {
      marginBottom: 0,
    },
  },
}));

const Row = withStyle(Rows, () => ({
  '@media only screen and (min-width: 768px) and (max-width: 991px)': {
    alignItems: 'center',
  },
}));

export const ProductCardWrapper = styled('div', () => ({
  height: '100%',
}));

export const LoaderWrapper = styled('div', () => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexWrap: 'wrap',
}));

export const LoaderItem = styled('div', () => ({
  width: '25%',
  padding: '0 15px',
  marginBottom: '30px',
}));

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

const GET_TYPES = gql`
  query GetTypes {
    types(limit: 0) {
      items {
        id
        name
        slug
        image
        icon
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

const GET_CATEGORIES = gql`
  query GetCategories {
    categories(limit: 0) {
      items {
        id
        parent_id
        name
        slug
        banner
        icon
      }
      totalCount
      hasMore
    }
  }
`;


export default function Products() {
  const [offset, setOffset] = useState(0);
  const { data: typeData, error: typeError, refetch: typeRefetch, loading: typeLoading } = useQuery(GET_TYPES);
  const { data: categoryData, error: categoryError, refetch: categoryRefetch, loading: categoryLoading } = useQuery(GET_CATEGORIES);
  const { data, error, refetch, fetchMore, loading } = useQuery(GET_PRODUCTS);

  const [loadingMore, toggleLoading] = useState(false);
  const [type, setType] = useState([]);
  const [category, setCategory] = useState([]);
  const [search, setSearch] = useState([]);
  const dispatch = useDrawerDispatch()

  const openDrawer = useCallback(
      () => dispatch({type: 'OPEN_DRAWER', drawerComponent: 'PRODUCT_FORM'}),
      [dispatch]
  );

  if (error) {
    return <div>Error! {error.message}</div>;
  }


  function loadMore() {
    toggleLoading(true);
    setOffset(offset+12);
    fetchMore({
      variables: {
        offset: offset + 12,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        toggleLoading(false);
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          products: {
            __typename: prev.products.__typename,
            items: [...prev.products.items, ...fetchMoreResult.products.items],
            hasMore: fetchMoreResult.products.hasMore,
          },
        });
      },
    });
  }
  function handleType({ value }) {
    setType(value);
    if (value.length) {
      refetch({
        type: value[0].slug,
      });
    } else {
      refetch({
        type: null,
      });
    }
  }
  function handleCategory({ value }) {
    setCategory(value);
    if (value.length) {
      refetch({
        category: value[0].slug,
      });
    } else {
      refetch({
        category: null,
      });
    }
  }
  function handleSearch(event) {
    const value = event.currentTarget.value;
    setSearch(value);
    refetch({ searchText: value });
  }

  return (
    <Grid fluid={true}>
      <Row>
        <Col md={12}>
          <Header style={{ marginBottom: 15 }}>
            <Col md={2} xs={12}>
              <Heading>Products</Heading>
            </Col>

            <Col md={10} xs={12}>
              <Row>
                <Col md={3} xs={12}>
                  <Select
                    options={typeData ? typeData.types.items : [] }
                    labelKey='name'
                    valueKey='slug'
                    placeholder='Select Type'
                    value={type}
                    searchable={true}
                    onChange={handleType}
                  />
                </Col>
                <Col md={3} xs={12}>
                  <Select
                    options={categoryData ? categoryData.categories.items : [] }
                    labelKey='name'
                    valueKey='slug'
                    placeholder='Select Category'
                    value={category}
                    searchable={true}
                    onChange={handleCategory}
                  />
                </Col>

                <Col md={4} xs={12}>
                  <Input
                    value={search}
                    placeholder='Ex: Search By Name'
                    onChange={handleSearch}
                    clearable
                  />
                </Col>
                <Col md={2}>
                  <Button
                      onClick={openDrawer}
                      startEnhancer={() => <Plus />}
                      overrides={{
                        BaseButton: {
                          style: () => ({
                            width: '100%',
                            borderTopLeftRadius: '3px',
                            borderTopRightRadius: '3px',
                            borderBottomLeftRadius: '3px',
                            borderBottomRightRadius: '3px',
                          }),
                        },
                      }}
                  >
                    Add Product
                  </Button>
                </Col>
              </Row>
            </Col>
          </Header>

          <Row>
            {data ? (
              data.products && data.products.items.length !== 0 ? (
                data.products.items.map((item: any, index: number) => (
                  <Col
                    md={4}
                    lg={3}
                    sm={6}
                    xs={12}
                    key={index}
                    style={{ margin: '15px 0' }}
                  >
                    <Fade bottom duration={800} delay={index * 10}>
                      <ProductCard
                        title={item.name}
                        weight={item.unit}
                        image={ADMIN_IMAGE_HOST+item.images[0]}
                        currency={CURRENCY}
                        price={item.price}
                        salePrice={item.sale_price}
                        discountInPercent={item.discount_in_percent}
                        itemsOffset={offset}
                        data={item}
                      />
                    </Fade>
                  </Col>
                ))
              ) : (
                <NoResult />
              )
            ) : (
              <LoaderWrapper>
                <LoaderItem>
                  <Placeholder />
                </LoaderItem>
                <LoaderItem>
                  <Placeholder />
                </LoaderItem>
                <LoaderItem>
                  <Placeholder />
                </LoaderItem>
                <LoaderItem>
                  <Placeholder />
                </LoaderItem>
              </LoaderWrapper>
            )}
          </Row>
          {data && data.products && data.products.hasMore && (
            <Row>
              <Col
                md={12}
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                <Button onClick={loadMore} isLoading={loadingMore}>
                  Load More
                </Button>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Grid>
  );
}
