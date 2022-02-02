import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation, useQuery} from '@apollo/react-hooks';
import { useDrawerDispatch, useDrawerState } from '../../context/DrawerContext';
import { Scrollbars } from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
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
import {getBase64Value} from "../../helpers/convert-image-base64";
import {ADMIN_IMAGE_HOST} from "../../helpers/images-path";
import Checkbox, {LABEL_PLACEMENT} from "../../components/CheckBox/CheckBox";
import {Select, TYPE} from "baseui/select";

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

const UPDATE_HOMECARD = gql`
  mutation UpdateHomeCard($id: String!, $name: String!, $url: String, $image: String!, $image_data: File, $status: Boolean, $types: String!) {
    updateHomeCard(id: $id, name: $name, url: $url, image: $image, image_data: $image_data, status: $status, types: $types) {
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
  }
`;

type Props = any;

const UpdateHomeCard: React.FC<Props> = props => {
  const { data: typeData, error: typeError, refetch: typeRefetch } = useQuery(GET_TYPES);


  const dispatch = useDrawerDispatch();
  const itemData = useDrawerState('data');

  const closeDrawer = useCallback(() => dispatch({ type: 'CLOSE_DRAWER' }), [
    dispatch,
  ]);
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: itemData,
  })
  const [status, setStatus] = useState(itemData.status ? itemData.status : true);
  const [types, setTypes] = useState([]);

  React.useEffect(() => {
    setTypes(itemData.types.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.slug
    })))
  }, [itemData]);

  React.useEffect(() => {
    register({name: 'image_data'});
    register({name: 'image', required: true});
    register({name: 'status'});
    register({name: 'types'});
  }, [register]);

  const { data, error, refetch } = useQuery(GET_HOMECARDS);

  const [updateHomeCard] = useMutation(UPDATE_HOMECARD);

  const onSubmit = ({ name, url, image, image_data, types }) => {

    console.log(types)

    updateHomeCard({
      variables: {
        id: itemData.id,
        name: name,
        url: url,
        image: image,
        image_data: image_data,
        status: status,
        types: JSON.stringify(types.map(type => ({
          id: type.id,
          name: type.name,
          slug: type.slug
        })))
      },
    });
    closeDrawer();
  };

  const handleUploader = files => {
    setValue('image_data', {name: files[0].name, size: files[0].size, type: files[0].type});

    getBase64Value(files[0], imageBase64Value => {
      setValue('image', imageBase64Value);
    })
  };

  const handleTypesMultiChange = ({ value }) => {
    let typeItems = [];
    for (let i = 0; i < value.length; i++) {
      typeItems.push({id: value[i].id, name: value[i].name, slug: value[i].slug})
    }
    setValue('types', typeItems);
    setTypes(value);
  };

  return (
    <>
      <DrawerTitleWrapper>
        <DrawerTitle>Update HomeCard</DrawerTitle>
      </DrawerTitleWrapper>

      <Form onSubmit={handleSubmit(onSubmit)} style={{ height: '100%' }} encType={'multipart/form-data'}>
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
              <FieldDetails>Upload your HomeCard image here</FieldDetails>
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
                <Uploader type={'file'} required={true} onChange={handleUploader} imageURL={ADMIN_IMAGE_HOST+itemData.image} />
              </DrawerBox>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              <FieldDetails>
                Update your homecard and necessary information's from here
              </FieldDetails>
            </Col>

            <Col lg={8}>
              <DrawerBox>
                <FormFields>
                  <FormLabel>Is Active?</FormLabel>
                  <Checkbox
                      checked={status}
                      onChange={e => {
                        setValue('status', e.target.checked)
                        setStatus(e.target.checked)
                      }}
                      labelPlacement={LABEL_PLACEMENT.right}
                  >
                  </Checkbox>
                </FormFields>

                <FormFields>
                  <FormLabel>Name</FormLabel>
                  <Input
                    inputRef={register({ required: true })}
                    name="name"
                    required={true}
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Url</FormLabel>
                  <Input
                    inputRef={register({})}
                    name="url"
                  />
                </FormFields>

                <FormFields>
                  <FormLabel>Select Types</FormLabel>
                  <Select
                      options={typeData ? typeData.types.items : [] }
                      labelKey="name"
                      valueKey="id"
                      placeholder="Select Main Types"
                      value={types}
                      required={true}
                      searchable={true}
                      onChange={handleTypesMultiChange}
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
            Update HomeCard
          </Button>
        </ButtonGroup>
      </Form>
    </>
  );
};

export default UpdateHomeCard;
