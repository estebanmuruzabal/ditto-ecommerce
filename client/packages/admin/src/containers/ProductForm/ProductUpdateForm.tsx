import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Scrollbars } from 'react-custom-scrollbars';
import { useDrawerDispatch, useDrawerState } from '../../context/DrawerContext';
import Uploader from '../../components/Uploader/Uploader';
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
import {gql} from "apollo-boost";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {getBase64Value} from "../../helpers/convert-image-base64";
import MultiUploader from "../../components/Uploader/Multi-Uploader";
import Checkbox, {LABEL_PLACEMENT} from "../../components/CheckBox/CheckBox";
import {TYPE} from "baseui/select";



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
`
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

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
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

const AddProduct: React.FC<Props> = () => {

  const { data: typeData, error: typeError, refetch: typeRefetch } = useQuery(GET_TYPES);
  const { data: categoryData, error: categoryError, refetch: categoryRefetch } = useQuery(GET_CATEGORIES);

  const dispatch = useDrawerDispatch();
  const itemData = useDrawerState('data');
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: itemData,
  });
  const [type, setType] = useState([{ id: itemData.type.id }]);
  const [category, setCategory] = useState([]);
  const [description, setDescription] = useState(itemData.description ? itemData.description : '');
  const [isFeatured, setIsFeatured] = useState(itemData.is_featured ? itemData.is_featured : false);
  const [meta_title, setMetaTitle] = useState(itemData.meta_title ? itemData.meta_title : '');
  const [meta_keyword, setMetaKeyword] = useState(itemData.meta_keyword ? itemData.meta_keyword : '');
  const [meta_description, setMetaDescription] = useState(itemData.meta_description ? itemData.meta_description : '');


  React.useEffect(() => {
    setCategory(itemData.categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    })))
  }, [itemData]);

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

  const { data, error, refetch } = useQuery(GET_PRODUCTS);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  const handleDescriptionChange = e => {
    const value = e.target.value;
    setValue('description', value);
    setDescription(value);
  };

  const handleCategoryMultiChange = ({ value }) => {
    let categoryItems = [];
    for (let i = 0; i < value.length; i++) {
      categoryItems.push({id: value[i].id, name: value[i].name, slug: value[i].slug})
    }
    setValue('categories', categoryItems);
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
      type: {
        id: data.type.id,
        name: data.type.name,
        slug: data.type.slug
      },
      categories: JSON.stringify(data.categories.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug
      }))),
      description: data.description,
      images_data: data.images_data,
      images: data.images,
      price: Number(data.price),
      unit: data.unit,
      sale_price: Number(data.sale_price),
      discount_in_percent: Number(data.discount_in_percent),
      product_quantity: Number(data.product_quantity),
      is_featured: data.is_featured,
      meta_title: data.meta_title,
      meta_keyword: data.meta_keyword,
      meta_description: data.meta_description,
    };
    updateProduct({
      variables: { id: itemData.id, input: newProduct },
    });

    closeDrawer();
  };

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Update Product</DrawerTitle>
      </DrawerTitleWrapper>

      <Form
        onSubmit={handleSubmit(onSubmit)}
        style={{ height: '100%' }}
        noValidate
      >
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
              <FieldDetails>Update your Product images here</FieldDetails>
            </Col>
            <Col lg={8}>
              <DrawerBox>
                <MultiUploader required={true}  onChange={handleUploader} imagesURL={itemData.images} />
              </DrawerBox>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <FieldDetails>
                Update your Product description and necessary information from here
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
                  <Input
                    type="number"
                    inputRef={register({ required: true })}
                    name="price"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Sale Price</FormLabel>
                  <Input type="number" inputRef={register} name="sale_price" />
                </FormFields>

                <FormFields>
                  <FormLabel>Discount In Percent</FormLabel>
                  <Input
                    type="number"
                    inputRef={register}
                    name="discount_in_percent"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Product Quantity</FormLabel>
                  <Input
                      type="number"
                      inputRef={register({ required: true })}
                      name="product_quantity" />
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
            Update Product
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default AddProduct;
