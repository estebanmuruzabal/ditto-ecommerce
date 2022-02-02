import React, { useCallback, useState } from 'react';
import { withStyle } from 'baseui';
import {
  Grid,
  Row as Rows,
  Col as Column,
} from '../../components/FlexBox/FlexBox';
import { useDrawerDispatch } from '../../context/DrawerContext';
import Select from '../../components/Select/Select';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Wrapper, Header, Heading } from '../../components/WrapperStyle';
import {
  TableWrapper,
  StyledTable,
  StyledHeadCell,
  StyledCell,
  ImageWrapper,
} from './Category.style';

import {
  Plus,
} from '../../components/AllSvgIcon';
import NoResult from '../../components/NoResult/NoResult';
import {IconWrapper, Image, StyledBodyCell} from '../Types/Types.style';
import ActionWrapper from '../CategoryForm/ActionWrapper';
import dayjs from "dayjs";
import {AllIcons} from "../../assets/icons/all-icons";
import {ADMIN_IMAGE_HOST} from "../../helpers/images-path";

const GET_CATEGORIES = gql`
  query GetCategories($type: String, $searchText: String, $offset: Int) {
    categories(type: $type, searchText: $searchText, offset: $offset) {
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

export default function Category() {
  const [type, setType] = useState([]);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const dispatch = useDrawerDispatch();
  const openDrawer = useCallback(
    () => dispatch({ type: 'OPEN_DRAWER', drawerComponent: 'CATEGORY_FORM' }),
    [dispatch]
  );

  const { data: typeData, error: typeError, refetch: typeRefetch, loading: typeLoading } = useQuery(GET_TYPES);
  const { data, error, refetch } = useQuery(GET_CATEGORIES);

  if (error) {
    return <div>Error! {error.message}</div>;
  }


  function handleSearch(event) {
    const value = event.currentTarget.value;
    setSearch(value);
    refetch({
      searchText: value,
    });
  }
  function handlePrevious() {
    setOffset(offset - 12);
    refetch({
      offset: offset - 12,
    });
  }
  function handlePreviousDisabled(data) {
    const result = (data ? data.categories.totalCount === 0 : false) || offset === 0;
    return result;
  }
  function handleNext() {
    setOffset(offset + 12);
    refetch({
      offset: offset + 12,
    });
  }
  function handleNextDisabled(data) {
    const result = data ? !data.categories.hasMore : true;
    return result;
  }

  function handleType({ value }) {
    setType(value);
    if (value.length) {
      refetch({
        type: value[0].id,
      });
    } else {
      refetch({
        type: null,
      });
    }
  }

  const Icon = ({ icon }) => {
    let Component =  AllIcons.hasOwnProperty(icon) ? AllIcons[icon] : 'span';
    return <Component />;
  }
  return (
    <Grid fluid={true}>
      <Row>
        <Col md={12}>
          <Header
            style={{
              marginBottom: 30,
              boxShadow: '0 0 5px rgba(0, 0 ,0, 0.05)',
            }}
          >
            <Col md={2}>
              <Heading>Categories</Heading>
            </Col>

            <Col md={10}>
              <Row>
                <Col md={3} lg={3}>
                  <Select
                      options={typeData ? typeData.types.items : [] }
                      labelKey='name'
                      valueKey='id'
                      placeholder='Select Category Type'
                      value={type}
                      searchable={true}
                      onChange={handleType}
                  />
                </Col>

                <Col md={5} lg={6}>
                  <Input
                    value={search}
                    placeholder='Ex: Search By Name'
                    onChange={handleSearch}
                    clearable
                  />
                </Col>

                <Col md={4} lg={3}>
                  <Button
                    onClick={openDrawer}
                    startEnhancer={() => <Plus />}
                    overrides={{
                      BaseButton: {
                        style: () => ({
                          width: '100%',
                          borderTopLeftRadius: '3px',
                          borderTopRightRadius: '3px',
                          borderBottomLeftRadius: '3px',
                          borderBottomRightRadius: '3px',
                        }),
                      },
                    }}
                  >
                    Add Category
                  </Button>
                </Col>
              </Row>
            </Col>
          </Header>

          <Wrapper style={{ boxShadow: '0 0 5px rgba(0, 0 , 0, 0.05)' }}>
            <TableWrapper>
              <StyledTable $gridTemplateColumns='minmax(70px, 70px)  minmax(150px, auto)  minmax(150px, auto) minmax(70px, 70px) minmax(70px, 70px) minmax(120px, auto) minmax(160px, 160px)'>
                <StyledHeadCell>#</StyledHeadCell>
                <StyledHeadCell>Name</StyledHeadCell>
                <StyledHeadCell>Slug</StyledHeadCell>
                <StyledHeadCell>Image</StyledHeadCell>
                <StyledHeadCell>Icon</StyledHeadCell>
                <StyledHeadCell>Created At</StyledHeadCell>
                <StyledHeadCell>Action</StyledHeadCell>

                {data ? (
                  data.categories.items.length ? (
                    data.categories.items.map((item, index) => (
                      <React.Fragment key={index}>
                        <StyledBodyCell>{index + 1}</StyledBodyCell>
                        <StyledBodyCell>{item.name}</StyledBodyCell>
                        <StyledBodyCell>{item.slug}</StyledBodyCell>
                        <StyledBodyCell>
                          <ImageWrapper>
                            <Image src={`${ADMIN_IMAGE_HOST}${item.banner}`} />
                          </ImageWrapper>
                        </StyledBodyCell>
                        <StyledBodyCell>
                          <IconWrapper>
                            <Icon icon={item.icon} />
                          </IconWrapper>
                        </StyledBodyCell>
                        <StyledBodyCell>
                          {dayjs(item.created_at).format('DD MMM YYYY hh:mm:ss A')}
                        </StyledBodyCell>
                        <StyledBodyCell>
                          <ActionWrapper itemsOffset={offset} itemData={item} />
                        </StyledBodyCell>
                      </React.Fragment>
                    ))
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
                style={handlePreviousDisabled(data) ? prevButtonDisabledStyles : { marginRight: '10px' }}
                disabled={handlePreviousDisabled(data)}
                onClick={handlePrevious}>
                Previous
                </Button>
              <Button
                style={handleNextDisabled(data) ? nextButtonDisabledStyles : null}
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
