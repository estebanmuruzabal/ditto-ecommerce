import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation, useQuery} from '@apollo/react-hooks';
import { Scrollbars } from 'react-custom-scrollbars';
import { useDrawerDispatch } from '../../context/DrawerContext';
import Button, { KIND } from '../../components/Button/Button';
import DrawerBox from '../../components/DrawerBox/DrawerBox';
import { Row, Col } from '../../components/FlexBox/FlexBox';
import Input from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import Select from '../../components/Select/Select';
import { FormFields, FormLabel } from '../../components/FormFields/FormFields';

import {
  Form,
  DrawerTitleWrapper,
  DrawerTitle,
  FieldDetails,
  ButtonGroup,
} from '../DrawerItems/DrawerItems.style';
import {getBase64Value} from "../../helpers/convert-image-base64";
import MultiUploader from "../../components/Uploader/Multi-Uploader";
import Checkbox, {LABEL_PLACEMENT} from "../../components/CheckBox/CheckBox";
import {TYPE} from "baseui/select";
import NumberInput from "../../components/Input/NumberInput";

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

const CREATE_PRODUCT = gql`
  mutation createProduct($input: ProductInput!) {
    createProduct(input: $input) {
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
  }
`;
type Props = any;

const AddProduct: React.FC<Props> = props => {
  const { data: typeData, error: typeError, refetch: typeRefetch, loading: typeLoading } = useQuery(GET_TYPES);
  const { data: categoryData, error: categoryError, refetch: categoryRefetch, loading: categoryLoading } = useQuery(GET_CATEGORIES);

  if(!categoryLoading) {
    categoryRefetch();
  }

  if(!typeLoading) {
    typeRefetch();
  }

  const dispatch = useDrawerDispatch();
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  const { register, handleSubmit, setValue } = useForm();
  const [type, setType] = useState([]);
  const [category, setCategory] = useState([]);
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [meta_title, setMetaTitle] = useState('');
  const [meta_keyword, setMetaKeyword] = useState('');
  const [meta_description, setMetaDescription] = useState('');

  React.useEffect(() => {
    register({name: 'images_data'});
    register({ name: 'type' });
    register({ name: 'categories' });
    register({ name: 'images', required: true });
    register({ name: 'description' });
    register({name: 'is_featured'});
    register({name: 'meta_title'});
    register({name: 'meta_keyword'});
    register({name: 'meta_description'});
  }, [register]);

  const handleDescriptionChange = e => {
    const value = e.target.value;
    setValue('description', value);
    setDescription(value);
  };

  const [createProduct] = useMutation(CREATE_PRODUCT, {
    update(cache, { data: { createProduct } }) {
      const { products } = cache.readQuery({
        query: GET_PRODUCTS,
      });

      cache.writeQuery({
        query: GET_PRODUCTS,
        data: {
          products: {
            __typename: products.__typename,
            items: [createProduct, ...products.items],
            hasMore: products.items.length + 1 >= 12,
            totalCount: products.items.length + 1,
          },
        },
      });
    },
  });

  const handleCategoryMultiChange = ({ value }) => {
    let categoryItems = [];
    for (let i = 0; i < value.length; i++) {
      categoryItems.push({id: value[i].id, name: value[i].name, slug: value[i].slug})
    }
    setValue('categories', JSON.stringify(categoryItems));
    setCategory(value);
  };

  const handleTypeChange = ({ value }) => {
    setValue('type', {
      id: value[0].id,
      name: value[0].name,
      slug: value[0].slug
    });
    setType(value);
  };
  const handleUploader = files => {
    let imagesData = [];
    let imagesBase64 = [];

    for (let i = 0; i < files.length; i++) {
      imagesData.push({name: files[i].name, size: files[i].size, type: files[i].type})
      getBase64Value(files[i], imageBase64Value => {
        imagesBase64.push(imageBase64Value);
      })
    }

    setValue('images_data', JSON.stringify(imagesData));
    setValue('images', imagesBase64);
  };

  const handleMetaTitleChange = e => {
    const value = e.target.value;
    setValue('meta_title', value);
    setMetaTitle(value);
  };
  const handleMetaKeywordChange = e => {
    const value = e.target.value;
    setValue('meta_keyword', value);
    setMetaKeyword(value);
  };

  const handleMetaDescriptionChange = e => {
    const value = e.target.value;
    setValue('meta_description', value);
    setMetaDescription(value);
  };

  const onSubmit = data => {
    if (!data.images) return alert('Please select images for product');

    const newProduct = {
      name: data.name,
      type: data.type,
      categories: data.categories,
      description: data.description,
      images_data: data.images_data,
      images: data.images,
      price: Number(data.price),
      unit: data.unit,
      sale_price: Number(data.salePrice),
      discount_in_percent: Number(data.discountInPercent),
      product_quantity: Number(data.quantity),
      is_featured: data.is_featured,
      meta_title: data.meta_title,
      meta_keyword: data.meta_keyword,
      meta_description: data.meta_description,
    };
    createProduct({
      variables: { input: newProduct },
    });
    closeDrawer();
  };

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Add Product</DrawerTitle>
      </DrawerTitleWrapper>

      <Form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }}>
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
            <Col lg={4}>
              <FieldDetails>Upload your Product images here</FieldDetails>
            </Col>
            <Col lg={8}>
              <DrawerBox
                overrides={{
                  Block: {
                    style: {
                      width: '100%',
                      height: 'auto',
                      padding: '30px',
                      borderRadius: '3px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                  },
                }}
              >
                <MultiUploader required={true}  onChange={handleUploader} />
              </DrawerBox>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <FieldDetails>
                Add your Product description and necessary information from here
              </FieldDetails>
            </Col>

            <Col lg={8}>
              <DrawerBox>
                <FormFields>
                  <FormLabel>Featured Product?</FormLabel>
                  <Checkbox
                      checked={isFeatured}
                      onChange={e => {
                        setValue('is_featured', e.target.checked)
                        setIsFeatured(e.target.checked)
                      }}
                      labelPlacement={LABEL_PLACEMENT.right}
                  >
                  </Checkbox>
                </FormFields>
                <FormFields>
                  <FormLabel>Name</FormLabel>
                  <Input
                    inputRef={register({ required: true, maxLength: 60 })}
                    name="name"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={description}
                    onChange={handleDescriptionChange}
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Unit</FormLabel>
                  <Input type="text" inputRef={register} name="unit" />
                </FormFields>

                <FormFields>
                  <FormLabel>Price</FormLabel>
                  <NumberInput
                    type="number"
                    inputRef={register({ required: true })}
                    name="price"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Sale Price</FormLabel>
                  <NumberInput
                      type="number"
                      inputRef={register}
                      name="salePrice" />
                </FormFields>

                <FormFields>
                  <FormLabel>Discount In Percent</FormLabel>
                  <Input
                      step="any"
                    type="number"
                    inputRef={register}
                    name="discountInPercent"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Product Quantity</FormLabel>
                  <Input
                    type="number"
                    inputRef={register({ required: true })}
                    name="quantity"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Type</FormLabel>
                  <Select
                    options={typeData ? typeData.types.items : [] }
                    labelKey="name"
                    valueKey="id"
                    placeholder="Select Product Type"
                    value={type}
                    required={true}
                    searchable={true}
                    onChange={handleTypeChange}
                    overrides={{
                      Placeholder: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      DropdownListItem: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      OptionContent: {
                        style: ({ $theme, $selected }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $selected
                              ? $theme.colors.textDark
                              : $theme.colors.textNormal,
                          };
                        },
                      },
                      SingleValue: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      Popover: {
                        props: {
                          overrides: {
                            Body: {
                              style: { zIndex: 5 },
                            },
                          },
                        },
                      },
                    }}
                    type={TYPE.search}
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Categories</FormLabel>
                  <Select
                    options={categoryData ? categoryData.categories.items : [] }
                    labelKey="name"
                    valueKey="id"
                    placeholder="Select Product Categories"
                    value={category}
                    required={true}
                    searchable={true}
                    onChange={handleCategoryMultiChange}
                    overrides={{
                      Placeholder: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      DropdownListItem: {
                        style: ({ $theme }) => {
                          return {
                            ...$theme.typography.fontBold14,
                            color: $theme.colors.textNormal,
                          };
                        },
                      },
                      Popover: {
                        props: {
                          overrides: {
                            Body: {
                              style: { zIndex: 5 },
                            },
                          },
                        },
                      },
                    }}
                    type={TYPE.search}
                    multi
                  />
                </FormFields>
                <FormFields>
                  <FormLabel>Meta Title</FormLabel>
                  <Input
                      name="meta_title"
                      value={meta_title}
                      onChange={handleMetaTitleChange}
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Meta Keyword</FormLabel>
                  <Input
                      name="meta_keyword"
                      value={meta_keyword}
                      onChange={handleMetaKeywordChange}
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Meta Description</FormLabel>
                  <Textarea
                      name="meta_description"
                      value={meta_description}
                      onChange={handleMetaDescriptionChange}
                  />
                </FormFields>
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
            Create Product
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default AddProduct;
