import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { useDrawerDispatch } from '../../context/DrawerContext';
import { Scrollbars } from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button, { KIND } from '../../components/Button/Button';
import DrawerBox from '../../components/DrawerBox/DrawerBox';
import { Row, Col } from '../../components/FlexBox/FlexBox';
import {
  Form,
  DrawerTitleWrapper,
  DrawerTitle,
  FieldDetails,
  ButtonGroup,
} from '../DrawerItems/DrawerItems.style';
import { FormFields, FormLabel } from '../../components/FormFields/FormFields';
import { getBase64Value } from '../../helpers/convert-image-base64';
import { displayErrorMessage, displaySuccessNotification } from '../../helpers/custom-message';
import { AllIconArray } from '../../assets/icons/all-icons';
import { TYPE } from 'baseui/select';
import { Textarea } from '../../components/Textarea/Textarea';

const GET_CATEGORIES = gql`
  query getCategories($searchText: String, $offset: Int) {
    categories(searchText: $searchText, offset: $offset) {
      items{
        id
        type_id
        name
        slug
        banner
        icon
        meta_title
        meta_keyword
        meta_description
        created_at
      }
    }   
  }
`;

const GET_CATEGORIES_FOR_LIST = gql`
  query ShopCategories {
    shopCategories(limit: 0) {
      items{
        id
        type_id
        name
        slug
        banner
        icon
        meta_title
        meta_keyword
        meta_description
      }
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($category: CategoryInput!) {
    createCategory(input: $category) {
      id
      type_id
      name
      slug
      banner
      icon
      meta_title
      meta_keyword
      meta_description
      created_at
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

type Props = any;

const AddCategory: React.FC<Props> = props => {
  const dispatch = useDrawerDispatch();
  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  const { register, handleSubmit, setValue } = useForm();
  const [category, setCategory] = useState({});
  const [type, setType] = useState([]);
  const [parentCategoryOptions, setParentCategoryOptions] = useState([]);
  const [meta_title, setMetaTitle] = useState('');
  const [meta_keyword, setMetaKeyword] = useState('');
  const [meta_description, setMetaDescription] = useState('');
  const [icon, setIcon] = useState([]);

  React.useEffect(() => {
    register({ name: 'type_id' });
    register({ name: 'parent' });
    register({ name: 'banner_data' });
    register({ name: 'banner', required: true});
    register({ name: 'icon', required: true});
    register({ name: 'meta_title' });
    register({ name: 'meta_keyword' });
    register({ name: 'meta_description' });
  }, [register]);

  const { data: typeData, error: typeError, refetch: typeRefetch, loading: typeLoading } = useQuery(GET_TYPES);
  const { data, error, refetch } = useQuery(GET_CATEGORIES_FOR_LIST);

  if (!typeLoading) {
    typeRefetch()
  }

  React.useEffect(() => {
    data && data.shopCategories && data.shopCategories.items
      && setParentCategoryOptions(data.shopCategories.items.map(category => ({
        value: category.id,
        name: category.name,
      })))
  }, [data]);

  const [createCategory] = useMutation(CREATE_CATEGORY, {

    onCompleted: () => {
      displaySuccessNotification("You've successfully created your type!");
    },
    onError: (e) => {
      
      displayErrorMessage(
        "Sorry! We weren't able to create your type. Please try again later."
      );
    },
    update(cache, { data: { createCategory } }) {
      const { categories } = cache.readQuery({
        query: GET_CATEGORIES,
      });

      cache.writeQuery({
        query: GET_CATEGORIES,
        data: {
          categories: {
            __typename: categories.__typename,
            items: [createCategory, ...categories.items],
            hasMore: categories.items.length + 1 >= 12,
            totalCount: categories.items.length + 1,
          },
        },
      });
    }
  });


  const onSubmit = (data) => {

    const { name, type_id, parent, meta_title, meta_keyword, meta_description, banner, banner_data }  = data ;
    const newCategory = {
      name: name,
      type_id: type_id[0].id,
      parent_id: parent ? parent[0].value : null,
      banner_data: banner_data,
      banner: banner,
      icon: icon[0].value,
      meta_title: meta_title,
      meta_keyword: meta_keyword,
      meta_description: meta_description,
    };

    createCategory({
      variables: { category: newCategory },
    });
    closeDrawer();
  };

  const handleParentCategoryChange = ({ value }) => {
    setValue('parent', value);
    setCategory(value);
  };

  const handleUploader = files => {

    setValue('banner_data', { name: files[0].name, size: files[0].size, type: files[0].type });

    getBase64Value(files[0], imageBase64Value => setValue('banner', imageBase64Value))
  };


  const handleIconChange = ({ value }) => {
    setValue('icon', value);
    setIcon(value);
  };

  const handleTypeChange = ({ value }) => {
    setValue('type_id', value);
    setType(value);
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

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Add Category</DrawerTitle>
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
              <FieldDetails>Upload your Category image here</FieldDetails>
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
                <Uploader onChange={handleUploader} />
              </DrawerBox>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <FieldDetails>
                Add your category description and necessary informations from
                here
              </FieldDetails>
            </Col>

            <Col lg={8}>
              <DrawerBox>
                <FormFields>
                  <FormLabel>Category Name</FormLabel>
                  <Input
                    inputRef={register({ required: true, maxLength: 20 })}
                    name="name"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Type</FormLabel>
                  <Select
                      options={typeData ? typeData.types.items : [] }
                      labelKey="name"
                      valueKey="id"
                      placeholder="Select Category Type"
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
                  <FormLabel>Parent</FormLabel>
                  <Select
                    options={parentCategoryOptions}
                    labelKey="name"
                    valueKey="value"
                    placeholder="Select parent category"
                    value={category}
                    searchable={false}
                    onChange={handleParentCategoryChange}
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
                  />
                </FormFields>
                <FormFields>
                  <FormLabel>Icon</FormLabel>
                  <Select
                    options={AllIconArray}
                    labelKey="value"
                    valueKey="value"
                    placeholder="Ex: Choose type icon"
                    name="parent"
                    value={icon}
                    required={true}
                    searchable={true}
                    onChange={handleIconChange}
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
                    maxDropdownHeight="300px"
                    type={TYPE.search}
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
            Create Category
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default AddCategory;
