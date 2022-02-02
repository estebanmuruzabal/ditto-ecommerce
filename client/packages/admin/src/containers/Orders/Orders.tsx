import React, {useState} from 'react';
import {styled, withStyle, createThemedUseStyletron} from 'baseui';
import dayjs from 'dayjs';
import {
    Grid,
    Row as Rows,
    Col as Column,
} from '../../components/FlexBox/FlexBox';
import Select from '../../components/Select/Select';
import Input from '../../components/Input/Input';

import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import {Wrapper, Header, Heading} from '../../components/WrapperStyle';

import {
    TableWrapper,
    StyledTable,
    StyledHeadCell,
    StyledCell,
} from './Orders.style';
import NoResult from '../../components/NoResult/NoResult';
import Button from "../../components/Button/Button";
import ActionWrapper from "../Orders/ActionWrapper";
import {StyledBodyCell} from "../Types/Types.style";

const GET_ORDERS = gql`
    query GetOrders(
        $status: String,
        $searchText: String
        $offset: Int
    ) {
        orders(
            status: $status,
            searchText: $searchText,
            offset: $offset,
        ) {
            items {
                id
                order_code
                customer_id
                contact_number
                datetime
                delivery_address
                payment_method
                payment_status
                status
                coupon_code
                discount_amount
                sub_total
                total
                delivery_method {
                    name
                    details
                }
                order_tracking {
                    status
                    ordering
                    is_current
                    step_competed
                }
            }
            totalCount
            hasMore
        }
    }
`;

type CustomThemeT = { red400: string; textNormal: string; colors: any };
const themedUseStyletron = createThemedUseStyletron<CustomThemeT>();

const Status = styled('div', ({$theme}) => ({
    ...$theme.typography.fontBold14,
    color: $theme.colors.textDark,
    display: 'flex',
    alignItems: 'center',
    lineHeight: '1',
    textTransform: 'capitalize',

    ':before': {
        content: '""',
        width: '10px',
        height: '10px',
        display: 'inline-block',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px',
        borderBottomLeftRadius: '10px',
        backgroundColor: $theme.borders.borderE6,
        marginRight: '10px',
    },
}));

const Col = withStyle(Column, () => ({
    '@media only screen and (max-width: 767px)': {
        marginBottom: '20px',

        ':last-child': {
            marginBottom: 0,
        },
    },
}));

const Row = withStyle(Rows, () => ({
    '@media only screen and (min-width: 768px)': {
        alignItems: 'center',
    },
}));

const prevButtonDisabledStyles = {
    width: '90px',
    marginRight: '10px',
    color: '#6f6f6f',
    backgroundColor: '#d8d8d8'
};
const nextButtonDisabledStyles = {
    width: '90px',
    marginLeft: '10px',
    color: '#6f6f6f',
    backgroundColor: '#d8d8d8'
};


const statusSelectOptions = [
    {value: 'Pending', label: 'Pending'},
    {value: 'Received', label: 'Received'},
    {value: 'Processing', label: 'Processing'},
    {value: 'InTransit', label: 'InTransit'},
    {value: 'Delivered', label: 'Delivered'},
    {value: 'Cancel', label: 'Cancel'},
    {value: 'Failed', label: 'Failed'},
];

export default function Orders() {

    const [useCss, theme] = themedUseStyletron();
    const sent = useCss({
        ':before': {
            content: '""',
            backgroundColor: theme.colors.primary,
        },
    });
    const failed = useCss({
        ':before': {
            content: '""',
            backgroundColor: theme.colors.red400,
        },
    });
    const processing = useCss({
        ':before': {
            content: '""',
            backgroundColor: theme.colors.textNormal,
        },
    });
    const paid = useCss({
        ':before': {
            content: '""',
            backgroundColor: theme.colors.blue400,
        },
    });

    const [status, setStatus] = useState([]);
    const [search, setSearch] = useState([]);
    const [offset, setOffset] = useState(0);

    const {data, error, refetch} = useQuery(GET_ORDERS);

    if (error) {
        return <div>Error! {error.message}</div>;
    }

    function handleStatus({value}) {
        setStatus(value);
        if (value.length) {
            refetch({
                status: value[0].value,
            });
        } else {
            refetch({status: null});
        }
    }

    function handleSearch(event) {
        const {value} = event.currentTarget;
        setSearch(value);
        refetch({searchText: value});
    }

    function handlePrevious() {
        setOffset(offset-12);
        refetch({
            offset: offset - 12,
        });
    }

    function handlePreviousDisabled(data) {
        const result = (data ? data.orders.totalCount === 0 : false) || offset === 0;
        return result;
    }

    function handleNext() {
        setOffset(offset+12);
        refetch({
            offset: offset + 12,
        });
    }

    function handleNextDisabled(data) {
        const result = data ? !data.orders.hasMore : true;
        return result;
    }

    return (
        <Grid fluid={true}>
            <Row>
                <Col md={12}>
                    <Header
                        style={{
                            marginBottom: 30,
                            boxShadow: '0 0 8px rgba(0, 0 ,0, 0.1)',
                        }}
                    >
                        <Col md={3} xs={12}>
                            <Heading>Orders</Heading>
                        </Col>

                        <Col md={9} xs={12}>
                            <Row>
                                <Col md={3} xs={12}>
                                    <Select
                                        options={statusSelectOptions}
                                        labelKey="label"
                                        valueKey="value"
                                        placeholder="Status"
                                        value={status}
                                        searchable={false}
                                        onChange={handleStatus}
                                    />
                                </Col>

                                <Col md={6} xs={12}>
                                    <Input
                                        value={search}
                                        placeholder="Ex: Search By Address"
                                        onChange={handleSearch}
                                        clearable
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Header>

                    <Wrapper style={{boxShadow: '0 0 5px rgba(0, 0 , 0, 0.05)'}}>
                        <TableWrapper>
                            <StyledTable
                                $gridTemplateColumns="minmax(150px, auto) minmax(150px, auto) minmax(200px, auto) minmax(200px, auto) minmax(200px, auto) minmax(150px, auto) minmax(150px, auto) minmax(150px, auto) minmax(150px, auto) minmax(150px, auto) minmax(150px, auto) minmax(150px, auto) minmax(150px, auto) minmax(150px, auto)">
                                <StyledHeadCell>Action</StyledHeadCell>
                                <StyledHeadCell>Order Code</StyledHeadCell>
                                <StyledHeadCell>Customer ID</StyledHeadCell>
                                <StyledHeadCell>Customer Contact</StyledHeadCell>
                                <StyledHeadCell>Delivery Address</StyledHeadCell>
                                <StyledHeadCell>Delivery Method</StyledHeadCell>
                                <StyledHeadCell>Payment Method</StyledHeadCell>
                                <StyledHeadCell>Payment Status</StyledHeadCell>
                                <StyledHeadCell>SubTotal</StyledHeadCell>
                                <StyledHeadCell>Total</StyledHeadCell>
                                <StyledHeadCell>Coupon Code</StyledHeadCell>
                                <StyledHeadCell>Discount Amount</StyledHeadCell>
                                <StyledHeadCell>Status</StyledHeadCell>
                                <StyledHeadCell>DateTime</StyledHeadCell>

                                {data ? (
                                    data.orders.items.length ? (
                                        data.orders.items.map((item: any, index: number) => {
                                            return (
                                                <React.Fragment key={index + 1}>
                                                    <StyledCell>
                                                        <ActionWrapper itemsOffset={offset} itemData={item}/>
                                                    </StyledCell>
                                                    <StyledCell>{item.order_code}</StyledCell>
                                                    <StyledCell>{item.customer_id}</StyledCell>
                                                    <StyledCell>{item.contact_number}</StyledCell>
                                                    <StyledCell>{item.delivery_address}</StyledCell>
                                                    <StyledCell>
                                                        {item.delivery_method ? item.delivery_method.name+', ' : ''}
                                                        {item.delivery_method ? item.delivery_method.details : ''}
                                                    </StyledCell>
                                                    <StyledCell>{item.payment_method}</StyledCell>
                                                    <StyledCell>{item.payment_status}</StyledCell>
                                                    <StyledCell>{item.sub_total}</StyledCell>
                                                    <StyledCell>{item.total}</StyledCell>
                                                    <StyledCell>{item.coupon_code}</StyledCell>
                                                    <StyledCell>{item.discount_amount}</StyledCell>
                                                    <StyledCell style={{justifyContent: 'center'}}>
                                                        <Status
                                                            className={
                                                                item.status.toLowerCase() === 'delivered'
                                                                    ? sent
                                                                    : item.status.toLowerCase() === 'pending'
                                                                    ? paid
                                                                    : item.status.toLowerCase() === 'processing'
                                                                        ? processing
                                                                        : item.status.toLowerCase() === 'failed'
                                                                            ? failed
                                                                            : ''
                                                            }
                                                        >
                                                            {item.status}
                                                        </Status>
                                                    </StyledCell>
                                                    <StyledCell>
                                                        {/*{dayjs(item.datetime).format('DD MMM YYYY hh:mm:ss A')}*/}
                                                    </StyledCell>
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <NoResult
                                            hideButton={false}
                                            style={{
                                                gridColumnStart: '1',
                                                gridColumnEnd: 'one',
                                            }}
                                        />
                                    )
                                ) : null}
                            </StyledTable>
                        </TableWrapper>
                    </Wrapper>

                    <Row>
                        <Col md={8}>
                        </Col>
                        <Col md={4}
                             style={{ display: 'block', textAlign: 'right', marginTop: '20px' }}
                        >
                            <Button
                                style={ handlePreviousDisabled(data) ? prevButtonDisabledStyles : {marginRight: '10px'}}
                                disabled={handlePreviousDisabled(data)}
                                onClick={handlePrevious}>
                                Previous
                            </Button>
                            <Button
                                style={ handleNextDisabled(data) ? nextButtonDisabledStyles : null}
                                disabled={handleNextDisabled(data)}
                                onClick={handleNext}>
                                Next
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Grid>
    );
}
