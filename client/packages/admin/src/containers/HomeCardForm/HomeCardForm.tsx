import React, {useState, useCallback} from 'react';
import {useForm} from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation, useQuery} from '@apollo/react-hooks';
import {useDrawerDispatch} from '../../context/DrawerContext';
import {Scrollbars} from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
import {Select, TYPE} from 'baseui/select';
import Button, {KIND} from '../../components/Button/Button';
import DrawerBox from '../../components/DrawerBox/DrawerBox';
import {Row, Col} from '../../components/FlexBox/FlexBox';
import {
    Form,
    DrawerTitleWrapper,
    DrawerTitle,
    FieldDetails,
    ButtonGroup,
} from '../DrawerItems/DrawerItems.style';
import {FormFields, FormLabel} from '../../components/FormFields/FormFields';
import {getBase64Value} from "../../helpers/convert-image-base64";
import {displaySuccessNotification, displayErrorMessage} from "../../helpers/custom-message";
import Checkbox, {LABEL_PLACEMENT} from "../../components/CheckBox/CheckBox";

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

const CREATE_HOMECARD = gql`    
    mutation CreateHomeCard($name: String!, $url: String, $image: String!, $image_data: File!, $status: Boolean, $types: String!) {
        createHomeCard(name: $name, url: $url, image: $image, image_data: $image_data, status: $status, types: $types) {
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

const AddHomeCard: React.FC<Props> = props => {
    const { data: typeData, error: typeError, refetch: typeRefetch } = useQuery(GET_TYPES);

    const dispatch = useDrawerDispatch();
    const closeDrawer = useCallback(() => dispatch({type: 'CLOSE_DRAWER'}), [
        dispatch,
    ]);
    const {register, handleSubmit, setValue} = useForm();
    const [status, setStatus] = useState(true);
    const [types, setTypes] = useState([]);

    React.useEffect(() => {
        register({name: 'image_data'});
        register({name: 'image', required: true});
        register({name: 'status'});
        register({name: 'types'});
    }, [register]);

    const [createHomeCard] = useMutation(CREATE_HOMECARD, {
        onCompleted: () => {
            displaySuccessNotification("You've successfully created your resource!");
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to create your resource. Please try again later."
            );
        },
        update(cache, {data: {createHomeCard}}) {
            const {homeCards} = cache.readQuery({
                query: GET_HOMECARDS,
            });

            cache.writeQuery({
                query: GET_HOMECARDS,
                data: {
                    homeCards: {
                        __typename: homeCards.__typename,
                        items: [createHomeCard, ...homeCards.items],
                        hasMore: homeCards.items.length + 1 >= 12,
                        totalCount: homeCards.items.length + 1,
                    },
                },
            });
        }
    });

    const onSubmit = ({name, url, image, image_data, types}) => {
        createHomeCard({
            variables: {
                name: name,
                url: url,
                image: image,
                image_data: image_data,
                status: status,
                types: types
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
        setValue('types', JSON.stringify(typeItems));
        setTypes(value);
    };

    return (
        <>
            <DrawerTitleWrapper>
                <DrawerTitle>Add HomeCard</DrawerTitle>
            </DrawerTitleWrapper>

            <Form onSubmit={handleSubmit(onSubmit)} style={{height: '100%'}} encType={'multipart/form-data'}>
                <Scrollbars
                    autoHide
                    renderView={props => (
                        <div {...props} style={{...props.style, overflowX: 'hidden'}}/>
                    )}
                    renderTrackHorizontal={props => (
                        <div
                            {...props}
                            style={{display: 'none'}}
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
                                <Uploader type={'file'} required={true} onChange={handleUploader}/>
                            </DrawerBox>
                        </Col>
                    </Row>

                    <Row>
                        <Col lg={4}>
                            <FieldDetails>
                                Add your homecard and necessary information's from here
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
                                        inputRef={register({required: true})}
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
                                style: ({$theme}) => ({
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
                                style: ({$theme}) => ({
                                    width: '50%',
                                    borderTopLeftRadius: '3px',
                                    borderTopRightRadius: '3px',
                                    borderBottomRightRadius: '3px',
                                    borderBottomLeftRadius: '3px',
                                }),
                            },
                        }}
                    >
                        Create HomeCard
                    </Button>
                </ButtonGroup>
            </Form>
        </>
    );
};

export default AddHomeCard;
