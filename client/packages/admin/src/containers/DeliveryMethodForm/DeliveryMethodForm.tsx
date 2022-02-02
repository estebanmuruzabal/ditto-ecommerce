import React, {useCallback} from 'react';
import {useForm} from 'react-hook-form';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import {useDrawerDispatch} from '../../context/DrawerContext';
import {Scrollbars} from 'react-custom-scrollbars';
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
import {displaySuccessNotification, displayErrorMessage} from "../../helpers/custom-message";

const GET_DELIVERY_METHODS = gql`
    query GetDeliveryMethods(
        $searchText: String
        $offset: Int
    ) {
        deliveryMethods(
            searchText: $searchText
            offset: $offset
        ) {
            items {
                id
                name
                details
                created_at
            }
            totalCount
            hasMore
        }
    }
`;

const CREATE_DELIVERY_METHOD = gql`    
    mutation CreateDeliveryMethod($name: String!, $details: String!) {
        createDeliveryMethod(name: $name, details: $details) {
            id
            name
            details
            created_at
        }
    }
`;

type Props = any;

const AddDeliveryMethod: React.FC<Props> = props => {
    const dispatch = useDrawerDispatch();
    const closeDrawer = useCallback(() => dispatch({type: 'CLOSE_DRAWER'}), [
        dispatch,
    ]);
    const {register, handleSubmit, setValue} = useForm();

    React.useEffect(() => { }, [register]);

    const [createDeliveryMethod] = useMutation(CREATE_DELIVERY_METHOD, {
        onCompleted: () => {
            displaySuccessNotification("You've successfully created your resource!");
        },
        onError: () => {
            displayErrorMessage(
                "Sorry! We weren't able to create your type. Please try again later."
            );
        },
        update(cache, {data: {createDeliveryMethod}}) {
            const {deliveryMethods} = cache.readQuery({
                query: GET_DELIVERY_METHODS,
            });

            cache.writeQuery({
                query: GET_DELIVERY_METHODS,
                data: {
                    deliveryMethods: {
                        __typename: deliveryMethods.__typename,
                        items: [createDeliveryMethod, ...deliveryMethods.items],
                        hasMore: deliveryMethods.items.length + 1 >= 12,
                        totalCount: deliveryMethods.items.length + 1,
                    },
                },
            });
        }
    });

    const onSubmit = ({name, details}) => {
        createDeliveryMethod({
            variables: {
                name: name,
                details: details,
            },
        });
        closeDrawer();
    };

    return (
        <>
            <DrawerTitleWrapper>
                <DrawerTitle>Add Delivery Method</DrawerTitle>
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
                            <FieldDetails>
                                Add your delivery method and necessary information's from here
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
                        Create Delivery Method
                    </Button>
                </ButtonGroup>
            </Form>
        </>
    );
};

export default AddDeliveryMethod;
