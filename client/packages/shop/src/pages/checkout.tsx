import React, {useContext, useEffect} from 'react';
import {NextPage, GetStaticProps} from 'next';
import Router from 'next/router';
import {useQuery} from '@apollo/react-hooks';
import {Modal} from '@redq/reuse-modal';
import { openModal } from '@redq/reuse-modal';
import {SEO} from 'components/seo';
import Checkout from 'features/checkouts/checkout-two/checkout-two';
import {GET_LOGGED_IN_USER} from 'graphql/query/customer.query';
import {DELIVERY_METHOD} from 'graphql/query/delivery';
import {PAYMENT_OPTION} from 'graphql/query/paymentoption';
import {ProfileProvider} from 'contexts/profile/profile.provider';
import ErrorMessage from 'components/error-message/error-message';
import ErrorMessageTwo from 'components/error-message/error-message-two';
import {AuthContext} from "../contexts/auth/auth.context";
import {FormattedMessage} from "react-intl";
import {Button} from "../components/button/button";
import styled from "styled-components";
import AuthenticationForm from "../features/authentication-form";
import { render } from 'react-dom';

type Props = {
    deviceType: {
        mobile: boolean;
        tablet: boolean;
        desktop: boolean;
    };
};

const LoginMessageDiv = styled.aside({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '15vh',
    padding: '0 1.5rem 1.5rem',
    fontSize: '22px',
    backgroundColor: '#fff',
});

const CheckoutPage: NextPage<Props> = ({deviceType}) => {
    const {data: deliverData, error: deliveryError, loading: deliveryLoading, refetch: deliveryRefetch} = useQuery(DELIVERY_METHOD)
    const {data: paymentData, error: paymentError, loading: paymentLoading, refetch: paymentRefetch} = useQuery(PAYMENT_OPTION);
    const {data, error, loading} = useQuery(GET_LOGGED_IN_USER);

    const {authDispatch} = useContext<any>(AuthContext);
    const toggleSignInForm = () => {
        authDispatch({
            type: 'SIGNIN',
        });

        openModal({
            show: true,
            overlayClassName: 'quick-view-overlay',
            closeOnClickOutside: true,
            component: AuthenticationForm,
            closeComponent: '',
            config:{
                enableResizing: false,
                disableDragging: true,
                className: 'quick-view-modal',
                width: 458,
                height: 'auto',
            },
        });
    };

    if (loading || deliveryLoading || paymentLoading) {
        return <ErrorMessage message={'Loading...'}/>
    }
    if (error || deliveryError || paymentError) {
        // @ts-ignore
        return (
            <>
                <ErrorMessageTwo message={'You are not authenticate user! Please login to place your order.'}/>
                <LoginMessageDiv>
                    <Modal>
                    <Button
                        type='button'
                        onClick={toggleSignInForm}
                        size='big'
                        style={{width: '200px'}}
                    >
                        Login Now
                    </Button>
                    </Modal>
                </LoginMessageDiv>
            </>
        )
    }
    const token = 'true';

    deliveryRefetch();
    paymentRefetch();

    console.dir(deliverData.deliveryMethods)
    console.dir(paymentData.paymentOptions)

    const checkoutData = {
        ...data.getUser,
        deliveryMethods: [],
        paymentMethods: [],
    }


    console.dir(deliverData)
    console.dir(paymentData)

    if (checkoutData.deliveryMethods.length == 0 && (deliverData || deliverData.deliveryMethods)) {
        checkoutData.deliveryMethods = [...deliverData.deliveryMethods.items];
    }

    if (checkoutData.paymentMethods.length == 0 && (paymentData || paymentData.paymentOptions)) {
        checkoutData.paymentMethods = [...paymentData.paymentOptions.items];
    }


    return (
        <>
            <SEO title="Checkout - Ditto" description="Checkout Details"/>
            <ProfileProvider initData={checkoutData}>
                <Modal>
                    <Checkout token={token} deviceType={deviceType}/>
                </Modal>
            </ProfileProvider>
        </>
    );
};

export default CheckoutPage;
