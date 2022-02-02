import React, {useState, useCallback} from 'react';
import {useForm} from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import {useDrawerDispatch} from '../../context/DrawerContext';
import {Scrollbars} from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
import {Textarea} from '../../components/Textarea/Textarea';
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
import {AllIconArray} from "../../assets/icons/all-icons";
import {getBase64Value} from "../../helpers/convert-image-base64";
import {displaySuccessNotification, displayErrorMessage} from "../../helpers/custom-message";

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

const CREATE_TYPE = gql`

    mutation CreateType($input: MainTypeInput!) {
        createType(input: $input) {
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
    }
`;

type Props = any;

const AddType: React.FC<Props> = props => {
    const dispatch = useDrawerDispatch();
    const closeDrawer = useCallback(() => dispatch({type: 'CLOSE_DRAWER'}), [
        dispatch,
    ]);
    const {register, handleSubmit, setValue} = useForm();
    const [home_title, setHomeTitle] = useState('');
    const [home_subtitle, setHomeSubtitle] = useState('');
    const [meta_title, setMetaTitle] = useState('');
    const [meta_keyword, setMetaKeyword] = useState('');
    const [meta_description, setMetaDescription] = useState('');
    const [icon, setIcon] = useState([]);
    React.useEffect(() => {
        register({name: 'icon', required: true});
        register({name: 'image_data'});
        register({name: 'image', required: true});
        register({name: 'home_title'});
        register({name: 'home_subtitle'});
        register({name: 'meta_title'});
        register({name: 'meta_keyword'});
        register({name: 'meta_description'});
    }, [register]);
    const [createType] = useMutation(CREATE_TYPE, {
        onCompleted: () => {
            displaySuccessNotification("You've successfully created your type!");
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to create your type. Please try again later."
            );
        },
        update(cache, {data: {createType}}) {
            const {types} = cache.readQuery({
                query: GET_TYPES,
            });

            cache.writeQuery({
                query: GET_TYPES,
                data: {
                    types: {
                        __typename: types.__typename,
                        items: [createType, ...types.items],
                        hasMore: types.items.length + 1 >= 12,
                        totalCount: types.items.length + 1,
                    },
                },
            });
        }
    });

    const onSubmit = ({name, icon, home_title, home_subtitle, meta_title, meta_keyword, meta_description, image, image_data}) => {
        const newType = {
            name: name,
            image_data: image_data,
            image: image,
            icon: icon[0].value,
            home_title: home_title,
            home_subtitle: home_subtitle,
            meta_title: meta_title,
            meta_keyword: meta_keyword,
            meta_description: meta_description,
        };
        createType({
            variables: {input: newType},
        });
        closeDrawer();
    };
    const handleChange = ({value}) => {
        setValue('icon', value);
        setIcon(value);
    };
    const handleUploader = files => {
        setValue('image_data', {name: files[0].name, size: files[0].size, type: files[0].type});

        getBase64Value(files[0], imageBase64Value => {
            setValue('image', imageBase64Value);
        })
    };

    const handleHomeTitleChange = e => {
        const value = e.target.value;
        setValue('home_title', value);
        setHomeTitle(value);
    };
    const handleHomeSubtitleChange = e => {
        const value = e.target.value;
        setValue('home_subtitle', value);
        setHomeSubtitle(value);
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
                <DrawerTitle>Add Type</DrawerTitle>
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
                            <FieldDetails>Upload your Type image here</FieldDetails>
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
                                Add your type and necessary information's from here
                            </FieldDetails>
                        </Col>

                        <Col lg={8}>
                            <DrawerBox>
                                <FormFields>
                                    <FormLabel>Type Name</FormLabel>
                                    <Input
                                        inputRef={register({required: true})}
                                        name="name"
                                        required={true}
                                    />
                                </FormFields>

                                <FormFields>
                                    <FormLabel>Icon</FormLabel>
                                    <Select
                                        options={AllIconArray}
                                        labelKey="value"
                                        valueKey="value"
                                        placeholder="Ex: Choose type icon"
                                        value={icon}
                                        required={true}
                                        searchable={true}
                                        onChange={handleChange}
                                        overrides={{
                                            Placeholder: {
                                                style: ({$theme}) => {
                                                    return {
                                                        ...$theme.typography.fontBold14,
                                                        color: $theme.colors.textNormal,
                                                    };
                                                },
                                            },
                                            DropdownListItem: {
                                                style: ({$theme}) => {
                                                    return {
                                                        ...$theme.typography.fontBold14,
                                                        color: $theme.colors.textNormal,
                                                    };
                                                },
                                            },
                                            OptionContent: {
                                                style: ({$theme, $selected}) => {
                                                    return {
                                                        ...$theme.typography.fontBold14,
                                                        color: $selected
                                                            ? $theme.colors.textDark
                                                            : $theme.colors.textNormal,
                                                    };
                                                },
                                            },
                                            SingleValue: {
                                                style: ({$theme}) => {
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
                                                            style: {zIndex: 5},
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
                                    <FormLabel>Type Home Title</FormLabel>
                                    <Input
                                        inputRef={register({required: true})}
                                        name="home_title"
                                        required={true}
                                        value={home_title}
                                        onChange={handleHomeTitleChange}
                                    />
                                </FormFields>

                                <FormFields>
                                    <FormLabel>Type Home Sub Title</FormLabel>
                                    <Input
                                        inputRef={register({required: true})}
                                        name="home_subtitle"
                                        required={true}
                                        value={home_subtitle}
                                        onChange={handleHomeSubtitleChange}
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
                        Create Type
                    </Button>
                </ButtonGroup>
            </Form>
        </>
    );
};

export default AddType;
