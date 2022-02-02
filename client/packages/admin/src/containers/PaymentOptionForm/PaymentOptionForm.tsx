import React, {useCallback} from 'react';
import {useForm} from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import {useDrawerDispatch} from '../../context/DrawerContext';
import {Scrollbars} from 'react-custom-scrollbars';
import Uploader from '../../components/Uploader/Uploader';
import Input from '../../components/Input/Input';
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

const GET_PAYMENT_OPTIONS = gql`
    query GetPaymentOptions(
        $searchText: String
        $offset: Int
    ) {
        paymentOptions(
            searchText: $searchText
            offset: $offset
        ) {
            items {
                id
                name
                type
                image
                details
                created_at
            }
            totalCount
            hasMore
        }
    }
`;

const CREATE_PAYMENT_OPTION = gql`    
    mutation CreatePaymentOption($name: String!, $type: String!, $image: String!, $image_data: String!, $details: String!) {
        createPaymentOption(name: $name, type: $type, image: $image, image_data: $image_data, details: $details) {
            id
            name
            type
            image
            details
            created_at
        }
    }
`;

type Props = any;

const AddPaymentOption: React.FC<Props> = props => {
    const dispatch = useDrawerDispatch();
    const closeDrawer = useCallback(() => dispatch({type: 'CLOSE_DRAWER'}), [
        dispatch,
    ]);
    const {register, handleSubmit, setValue} = useForm();

    React.useEffect(() => {
        register({name: 'image_data'});
        register({name: 'image', required: true});
    }, [register]);
    const [createPaymentOption] = useMutation(CREATE_PAYMENT_OPTION, {
        onCompleted: () => {
            displaySuccessNotification("You've successfully created your payment option!");
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to create your type. Please try again later."
            );
        },
        update(cache, {data: {createPaymentOption}}) {
            const {paymentOptions} = cache.readQuery({
                query: GET_PAYMENT_OPTIONS,
            });

            cache.writeQuery({
                query: GET_PAYMENT_OPTIONS,
                data: {
                    paymentOptions: {
                        __typename: paymentOptions.__typename,
                        items: [createPaymentOption, ...paymentOptions.items],
                        hasMore: paymentOptions.items.length + 1 >= 12,
                        totalCount: paymentOptions.items.length + 1,
                    },
                },
            });
        }
    });

    const onSubmit = ({name, type, details, image, image_data}) => {
        createPaymentOption({
            variables: {
                name: name,
                type: type,
                details: details,
                image_data: image_data,
                image: image,
            },
        });
        closeDrawer();
    };

    const handleUploader = files => {
        setValue('image_data', JSON.stringify({name: files[0].name, size: files[0].size, type: files[0].type}));

        getBase64Value(files[0], imageBase64Value => {
            setValue('image', imageBase64Value);
        })
    };

    return (
        <>
            <DrawerTitleWrapper>
                <DrawerTitle>Add Payment Option</DrawerTitle>
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
                            <FieldDetails>Upload your PaymentOption image here</FieldDetails>
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
                                Add your payment option and necessary information's from here
                            </FieldDetails>
                        </Col>

                        <Col lg={8}>
                            <DrawerBox>
                                <FormFields>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        inputRef={register({required: true})}
                                        name="name"
                                        required={true}
                                    />
                                </FormFields>

                                <FormFields>
                                    <FormLabel>Type</FormLabel>
                                    <Input
                                        inputRef={register({required: true})}
                                        name="type"
                                        required={true}
                                    />
                                </FormFields>

                                <FormFields>
                                    <FormLabel>Details</FormLabel>
                                    <Input
                                        inputRef={register({required: true})}
                                        name="details"
                                        required={true}
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
                        Create Payment Option
                    </Button>
                </ButtonGroup>
            </Form>
        </>
    );
};

export default AddPaymentOption;
